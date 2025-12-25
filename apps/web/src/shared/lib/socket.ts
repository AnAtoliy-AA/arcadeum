import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import { resolveApiUrl } from './api-base';
import {
  maybeDecrypt,
  maybeEncrypt,
  isSocketEncryptionEnabled,
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
  transports: ['websocket'],
  autoConnect: false,
};

const gamesSocket = io(
  `${SOCKET_BASE_URL}/games`,
  SOCKET_OPTIONS,
) as AuthenticatedSocket;

const chatsSocket = io(SOCKET_BASE_URL, SOCKET_OPTIONS) as AuthenticatedSocket;

let currentAuthToken: string | null = null;

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
