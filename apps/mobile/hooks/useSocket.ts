import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import { getAppExtra } from '@/lib/expoConstants';
import { resolveApiBase } from '@/lib/apiBase';
import {
  maybeDecrypt,
  maybeEncrypt,
  isSocketEncryptionEnabled,
  setEncryptionKey,
  resetEncryptionKey,
  hasEncryptionKey,
} from '@/lib/socket-encryption';

function resolveSocketUrl(): string {
  const extra = getAppExtra();
  const rawBase =
    (process.env.EXPO_PUBLIC_WS_BASE_URL as string | undefined) ??
    (extra as import('../lib/expoConstants').AppExpoConfig)?.WS_BASE_URL ??
    resolveApiBase();

  try {
    const url = new URL(rawBase);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.toString().replace(/\/$/, '');
  } catch {
    return rawBase.replace(/\/$/, '');
  }
}

const SOCKET_BASE_URL = resolveSocketUrl();

type AuthenticatedSocket = Socket & {
  auth: Record<string, unknown>;
};

const SOCKET_OPTIONS = {
  transports: ['websocket'] as string[],
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

    const success = setEncryptionKey(data.key);
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

  if (gamesSocket.connected) {
    gamesSocket.disconnect();
  }
  if (chatsSocket.connected) {
    chatsSocket.disconnect();
  }

  gamesSocket.auth = {};
  chatsSocket.auth = {};
  resetEncryptionKey();
}

export const gameSocket: Socket = gamesSocket;

export const chatSocket: Socket = chatsSocket;

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

/**
 * Shared hook for subscribing to socket events with optional decryption.
 */
function useSocketListener<T extends unknown[]>(
  socket: Socket,
  event: string,
  handler: (...args: T) => void,
): void {
  useEffect(() => {
    const listener = async (...args: unknown[]) => {
      // Decrypt the first argument if encryption is enabled and key is available
      if (
        args.length > 0 &&
        isSocketEncryptionEnabled() &&
        hasEncryptionKey()
      ) {
        const decrypted = await maybeDecrypt<T[0]>(args[0]);
        const reconstructed = [decrypted, ...args.slice(1)] as unknown as T;
        handler(...reconstructed);
        return;
      }
      handler(...(args as T));
    };

    socket.on(event, listener);

    return () => {
      socket.off(event, listener);
    };
  }, [socket, event, handler]);
}

export function useSocket<T extends unknown[]>(
  event: string,
  handler: (...args: T) => void,
): void {
  useSocketListener(gameSocket, event, handler);
}

export function useChatSocket<T extends unknown[]>(
  event: string,
  handler: (...args: T) => void,
): void {
  useSocketListener(chatSocket, event, handler);
}
