import { useState, useEffect, useRef, useCallback } from 'react';

import { IDLE_TIMER_DURATION_SEC } from '../../../../../constants/game';

const IDLE_TIMEOUT_SECONDS = IDLE_TIMER_DURATION_SEC;

interface UseIdleTimerOptions {
  enabled: boolean;
  isMyTurn: boolean;
  canAct: boolean;
  onTimeout: () => void;
}

interface UseIdleTimerReturn {
  secondsRemaining: number;
  isActive: boolean;
  reset: () => void;
}

/**
 * Hook to manage idle timer for autoplay trigger.
 * Counts down from configured duration when it's the player's turn.
 * Calls onTimeout when timer reaches 0.
 */
export function useIdleTimer({
  enabled,
  isMyTurn,
  canAct,
  onTimeout,
}: UseIdleTimerOptions): UseIdleTimerReturn {
  const [secondsRemaining, setSecondsRemaining] =
    useState(IDLE_TIMEOUT_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasTriggeredRef = useRef(false);

  const shouldRun = enabled && isMyTurn && canAct;

  const reset = useCallback(() => {
    setSecondsRemaining(IDLE_TIMEOUT_SECONDS);
    hasTriggeredRef.current = false;
  }, []);

  // Reset timer when turn changes or enabled state changes
  useEffect(() => {
    if (shouldRun) {
      reset();
    }
  }, [shouldRun, reset]);

  // Countdown logic
  useEffect(() => {
    if (!shouldRun) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev: number) => {
        if (prev <= 1) {
          if (!hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            onTimeout();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [shouldRun, onTimeout]);

  return {
    secondsRemaining,
    isActive: shouldRun && secondsRemaining > 0,
    reset,
  };
}
