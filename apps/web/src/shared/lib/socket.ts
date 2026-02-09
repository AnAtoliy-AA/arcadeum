import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import { resolveApiUrl } from './api-base';
import {
  maybeDecrypt,
  maybeEncrypt,
  isSocketEncryptionEnabled,
  setEncryptionKey,
  resetEncryptionKey,
  hasEncryptionKey,
} from './socket-encryption';

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
      console.warn('[socket] Invalid encryption key data from server');
      return;
    }

    const success = await setEncryptionKey(data.key);
    if (success) {
      console.debug('[socket] Encryption key received and set');
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

  if (!gamesSocket.connected) {
    gamesSocket.connect();
  }
  if (!chatsSocket.connected) {
    chatsSocket.connect();
  }
}

/**
 * Connect game socket without authentication (for spectating public games)
 */
export function connectSocketsAnonymous(): void {
  // Disconnect if currently authenticated
  if (currentAuthToken) {
    disconnectSockets();
  }

  // Clear any auth
  gamesSocket.auth = {};

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

  gamesSocket.auth = {};
  chatsSocket.auth = {};
  resetEncryptionKey();
}

export const gameSocket: Socket = gamesSocket;
export const chatSocket: Socket = chatsSocket;

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
      if (
        args.length > 0 &&
        isSocketEncryptionEnabled() &&
        hasEncryptionKey()
      ) {
        const decrypted = await maybeDecrypt(args[0]);
        if (decrypted !== null) {
          handler(decrypted, ...args.slice(1));
        }
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
      if (
        args.length > 0 &&
        isSocketEncryptionEnabled() &&
        hasEncryptionKey()
      ) {
        const decrypted = await maybeDecrypt(args[0]);
        if (decrypted !== null) {
          handler(decrypted, ...args.slice(1));
        }
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
