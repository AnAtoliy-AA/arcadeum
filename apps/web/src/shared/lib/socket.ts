import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import { resolveApiUrl } from './api-base';
import {
  maybeDecrypt,
  maybeEncrypt,
  isSocketEncryptionEnabled,
  setEncryptionKey,
  resetEncryptionKey,
} from './socket-encryption';
import { useSocketStatus } from './socket-status';

function resolveSocketUrl(): string {
  const apiUrl = resolveApiUrl('');

  try {
    const url = new URL(apiUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.toString().replace(/\/$/, '');
  } catch {
    return apiUrl.replace(/\/$/, '');
  }
}

const SOCKET_BASE_URL = resolveSocketUrl();

type AuthenticatedSocket = Socket & {
  auth: Record<string, unknown>;
};

const SOCKET_OPTIONS = {
  transports: ['polling', 'websocket'],
  autoConnect: false,
};

const gamesSocket = io(
  `${SOCKET_BASE_URL}/games`,
  SOCKET_OPTIONS,
) as AuthenticatedSocket;

const chatsSocket = io(SOCKET_BASE_URL, SOCKET_OPTIONS) as AuthenticatedSocket;

const leaderboardsSocket = io(
  `${SOCKET_BASE_URL}/leaderboards`,
  SOCKET_OPTIONS,
) as AuthenticatedSocket;

const friendsSock = io(
  `${SOCKET_BASE_URL}/friends`,
  SOCKET_OPTIONS,
) as AuthenticatedSocket;

const walletSock = io(`${SOCKET_BASE_URL}/wallet`, {
  transports: ['websocket'],
  autoConnect: false,
}) as AuthenticatedSocket;

let currentAuthToken: string | null = null;

/**
 * Message queue for messages waiting on encryption key
 */
type QueuedMessage = { event: string; payload: unknown };
const messageQueue: QueuedMessage[] = [];

/**
 * Process queued messages after encryption key is received
 */
async function flushMessageQueue(): Promise<void> {
  while (messageQueue.length > 0) {
    const msg = messageQueue.shift();
    if (msg) {
      const data = await maybeEncrypt(msg.payload);
      gamesSocket.emit(msg.event, data);
    }
  }
}

/**
 * Set up encryption key handler for a socket
 */
function setupEncryptionKeyHandler(socket: AuthenticatedSocket): void {
  socket.on('socket.encryption_key', async (data: { key?: string }) => {
    if (!data?.key) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[socket] Invalid encryption key data from server');
      }
      return;
    }

    const success = await setEncryptionKey(data.key);
    if (success) {
      await flushMessageQueue();
    }
  });

  socket.on('disconnect', () => {
    resetEncryptionKey();
    messageQueue.length = 0;
  });
}

// Set up encryption key handler for games socket
setupEncryptionKeyHandler(gamesSocket);

// Wire up global connection status tracking
gamesSocket.on('connect', () => {
  useSocketStatus.getState().setConnected(true);
});

gamesSocket.on('disconnect', () => {
  useSocketStatus.getState().setConnected(false);
});

gamesSocket.io.on('reconnect_attempt', () => {
  useSocketStatus.getState().incrementReconnectAttempts();
});

gamesSocket.io.on('reconnect', () => {
  useSocketStatus.getState().resetReconnectAttempts();
});

function applyAuth(socketInstance: AuthenticatedSocket, token: string): void {
  socketInstance.auth = { token };
}

export function connectSockets(token: string | null | undefined): void {
  if (!token) {
    disconnectSockets();
    return;
  }

  if (currentAuthToken !== token) {
    currentAuthToken = token;

    if (gamesSocket.connected) {
      gamesSocket.disconnect();
    }
    if (chatsSocket.connected) {
      chatsSocket.disconnect();
    }
  }

  applyAuth(gamesSocket, token);
  applyAuth(chatsSocket, token);
  applyAuth(friendsSock, token);

  if (!gamesSocket.connected) {
    gamesSocket.connect();
  }
  if (!chatsSocket.connected) {
    chatsSocket.connect();
  }
  if (!friendsSock.connected) {
    friendsSock.connect();
  }
}

/**
 * Connect the leaderboards namespace socket only when a page that needs it
 * mounts (currently /leaderboards). Auth is applied if a token is provided.
 * Returns a teardown function the caller should run on unmount so we don't
 * leak background pings.
 */
export function connectLeaderboardSocket(
  token: string | null | undefined,
): () => void {
  if (token) applyAuth(leaderboardsSocket, token);
  else leaderboardsSocket.auth = {};
  if (!leaderboardsSocket.connected) leaderboardsSocket.connect();
  return () => {
    if (leaderboardsSocket.connected) leaderboardsSocket.disconnect();
  };
}

export function connectFriendsSocket(
  token: string | null | undefined,
): () => void {
  if (token) applyAuth(friendsSock, token);
  else friendsSock.auth = {};
  if (!friendsSock.connected) friendsSock.connect();
  return () => {
    if (friendsSock.connected) friendsSock.disconnect();
  };
}

export function connectWalletSocket(token: string): void {
  walletSock.auth = { token };
  if (!walletSock.connected) walletSock.connect();
}

export function disconnectWalletSocket(): void {
  if (walletSock.connected) walletSock.disconnect();
}

/**
 * Connect game socket without authentication (for spectating public games)
 * Pass the anonymous userId so the backend sends the encryption key
 */
export function connectSocketsAnonymous(userId?: string): void {
  // Disconnect if currently authenticated
  if (currentAuthToken) {
    disconnectSockets();
  }

  // Clear any auth
  gamesSocket.auth = {};

  // Pass anonId so gateway recognizes the client and sends encryption key
  if (userId) {
    gamesSocket.io.opts.query = {
      ...(gamesSocket.io.opts.query as Record<string, string>),
      anonId: userId,
    };
  }

  if (!gamesSocket.connected) {
    gamesSocket.connect();
  }
}

export function disconnectSockets(): void {
  currentAuthToken = null;

  if (gamesSocket) {
    gamesSocket.disconnect();
  }
  if (chatsSocket) {
    chatsSocket.disconnect();
  }
  if (leaderboardsSocket) {
    leaderboardsSocket.disconnect();
  }
  if (friendsSock) {
    friendsSock.disconnect();
  }
  if (walletSock) {
    walletSock.disconnect();
  }

  gamesSocket.auth = {};
  chatsSocket.auth = {};
  leaderboardsSocket.auth = {};
  friendsSock.auth = {};
  walletSock.auth = {};
  resetEncryptionKey();
}

export const gameSocket: Socket = gamesSocket;
export const chatSocket: Socket = chatsSocket;
export const leaderboardSocket: Socket = leaderboardsSocket;
export const friendsSocket: Socket = friendsSock;
export const walletSocket: Socket = walletSock;

// Expose sockets to window for E2E testing
if (typeof window !== 'undefined') {
  const win = window as unknown as Record<string, unknown>;
  win.gameSocket = gameSocket;
  win.chatSocket = chatSocket;
}

/**
 * Emit a message with optional encryption.
 */
export async function emitEncrypted(
  socket: Socket,
  event: string,
  payload: unknown,
): Promise<void> {
  const data = await maybeEncrypt(payload);
  socket.emit(event, data);
}

interface SocketEventHandler {
  (...args: unknown[]): void;
}

export function useSocket(event: string, handler: SocketEventHandler): void {
  useEffect(() => {
    const listener = async (...args: unknown[]) => {
      if (args.length > 0 && isSocketEncryptionEnabled()) {
        const decrypted = await maybeDecrypt(args[0]);
        handler(decrypted, ...args.slice(1));
        return;
      }
      handler(...args);
    };

    gameSocket.on(event, listener);

    return () => {
      gameSocket.off(event, listener);
    };
  }, [event, handler]);
}

export function useChatSocket(
  event: string,
  handler: SocketEventHandler,
): void {
  useEffect(() => {
    const listener = async (...args: unknown[]) => {
      if (args.length > 0 && isSocketEncryptionEnabled()) {
        const decrypted = await maybeDecrypt(args[0]);
        handler(decrypted, ...args.slice(1));
        return;
      }
      handler(...args);
    };

    chatSocket.on(event, listener);

    return () => {
      chatSocket.off(event, listener);
    };
  }, [event, handler]);
}

export function useLeaderboardSocket(
  event: string,
  handler: SocketEventHandler,
): void {
  useEffect(() => {
    const listener = (...args: unknown[]) => handler(...args);
    leaderboardSocket.on(event, listener);
    return () => {
      leaderboardSocket.off(event, listener);
    };
  }, [event, handler]);
}

export function useFriendsSocket(
  event: string,
  handler: SocketEventHandler,
): void {
  useEffect(() => {
    const listener = (...args: unknown[]) => handler(...args);
    friendsSocket.on(event, listener);
    return () => {
      friendsSocket.off(event, listener);
    };
  }, [event, handler]);
}
