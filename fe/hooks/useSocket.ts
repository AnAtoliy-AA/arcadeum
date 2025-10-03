import { useEffect } from 'react';
import { io } from 'socket.io-client';
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

export const socket = io(resolveSocketUrl(), { transports: ['websocket'] });

interface SocketEventHandler {
  (...args: any[]): void;
}

export function useSocket(event: string, handler: SocketEventHandler): void {
  useEffect(() => {
    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [event, handler]);
}