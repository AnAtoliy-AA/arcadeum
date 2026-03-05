import { useEffect, useRef, useCallback, useState } from 'react';
import { gameSocket } from '@/shared/lib/socket';

const ACTIVITY_EVENTS: (keyof DocumentEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
];

const DEFAULT_TIMEOUT_MS = 60_000;

interface UseIdleDetectionOptions {
  roomId: string | undefined;
  userId: string | null;
  timeoutMs?: number;
  enabled?: boolean;
}

interface UseIdleDetectionReturn {
  isIdle: boolean;
}

export function useIdleDetection({
  roomId,
  userId,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  enabled = true,
}: UseIdleDetectionOptions): UseIdleDetectionReturn {
  const [isIdle, setIsIdle] = useState(false);
  const isIdleRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendIdle = useCallback(() => {
    if (!roomId || !userId || isIdleRef.current) return;
    isIdleRef.current = true;
    setIsIdle(true);
    gameSocket.emit('games.player.idle', { roomId, userId });
  }, [roomId, userId]);

  const sendActive = useCallback(() => {
    if (!roomId || !userId || !isIdleRef.current) return;
    isIdleRef.current = false;
    setIsIdle(false);
    gameSocket.emit('games.player.active', { roomId, userId });
  }, [roomId, userId]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(sendIdle, timeoutMs);
  }, [sendIdle, timeoutMs]);

  const handleActivity = useCallback(() => {
    if (isIdleRef.current) {
      sendActive();
    }
    resetTimer();
  }, [sendActive, resetTimer]);

  useEffect(() => {
    if (!enabled || !roomId || !userId) return;

    resetTimer();

    ACTIVITY_EVENTS.forEach((evt) => {
      document.addEventListener(evt, handleActivity, { passive: true });
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      ACTIVITY_EVENTS.forEach((evt) => {
        document.removeEventListener(evt, handleActivity);
      });

      if (isIdleRef.current) {
        isIdleRef.current = false;
        setIsIdle(false);
        gameSocket.emit('games.player.active', { roomId, userId });
      }
    };
  }, [enabled, roomId, userId, handleActivity, resetTimer]);

  return { isIdle };
}
