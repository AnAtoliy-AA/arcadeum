import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import Constants from 'expo-constants';
import { platform } from '@/constants/platform';

function resolveSocketUrl(): string {
  // 1) Explicit override via env (works in Expo with EXPO_PUBLIC_*)
  const envUrl = process.env.EXPO_PUBLIC_API_URL;

  if (envUrl) return envUrl;

  // 2) Expo Go / Dev Client: derive host from Metro debugger host
  const hostFromExpo =
    Constants.expoGoConfig?.debuggerHost?.split(':')[0] ||
    Constants.expoGoConfig?.hostUri?.split(':')[0];

  if (hostFromExpo) return `http://${hostFromExpo}:4000`;

  // 3) Web: use current hostname
  if (platform.isWeb && typeof window !== 'undefined') {
    return `http://${window.location.hostname}:4000`;
  }

  // 4) Emulators fallback
  const fallbackHost = platform.isAndroid ? '10.0.2.2' : 'localhost';

  return `http://${fallbackHost}:4000`;
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

interface SocketEventHandler {
  (...args: any[]): void;
}

export function useSocket(event: string, handler: SocketEventHandler): void {
  useEffect(() => {
    gameSocket.on(event, handler);

    return () => {
      gameSocket.off(event, handler);
    };
  }, [event, handler]);
}

export function useChatSocket(
  event: string,
  handler: SocketEventHandler,
): void {
  useEffect(() => {
    chatSocket.on(event, handler);

    return () => {
      chatSocket.off(event, handler);
    };
  }, [event, handler]);
}
