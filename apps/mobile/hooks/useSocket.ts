import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import { getAppExtra } from '@/lib/expoConstants';
import { resolveApiBase } from '@/lib/apiBase';

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

export function useSocket<T extends unknown[]>(
  event: string,
  handler: (...args: T) => void,
): void {
  useEffect(() => {
    const listener = (...args: unknown[]) => {
      handler(...(args as T));
    };

    gameSocket.on(event, listener);

    return () => {
      gameSocket.off(event, listener);
    };
  }, [event, handler]);
}

export function useChatSocket<T extends unknown[]>(
  event: string,
  handler: (...args: T) => void,
): void {
  useEffect(() => {
    const listener = (...args: unknown[]) => {
      handler(...(args as T));
    };

    chatSocket.on(event, listener);

    return () => {
      chatSocket.off(event, listener);
    };
  }, [event, handler]);
}
