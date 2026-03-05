import { useEffect, useCallback, useState, useRef } from 'react';
import { useGameStore } from '@/features/games/store/gameStore';
import { connectSockets } from '@/shared/lib/socket';

const ACTIVITY_EVENTS: (keyof DocumentEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
];

interface UseIdleReconnectOptions {
  accessToken: string | null;
  enabled?: boolean;
}

interface UseIdleReconnectReturn {
  isDisconnected: boolean;
  isReconnecting: boolean;
  reconnect: () => void;
}

export function useIdleReconnect({
  accessToken,
  enabled = true,
}: UseIdleReconnectOptions): UseIdleReconnectReturn {
  const isConnected = useGameStore((s) => s.isConnected);
  const room = useGameStore((s) => s.room);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectingRef = useRef(false);

  const isDisconnected = enabled && !isConnected && !!room;

  const reconnect = useCallback(() => {
    if (reconnectingRef.current || !accessToken) return;
    reconnectingRef.current = true;
    setIsReconnecting(true);
    connectSockets(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (isConnected && reconnectingRef.current) {
      reconnectingRef.current = false;
      queueMicrotask(() => setIsReconnecting(false));
    }
  }, [isConnected]);

  useEffect(() => {
    if (!isDisconnected || reconnectingRef.current) return;

    const handleActivity = () => {
      reconnect();
    };

    ACTIVITY_EVENTS.forEach((evt) => {
      document.addEventListener(evt, handleActivity, { once: true });
    });

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => {
        document.removeEventListener(evt, handleActivity);
      });
    };
  }, [isDisconnected, reconnect]);

  return { isDisconnected, isReconnecting, reconnect };
}
