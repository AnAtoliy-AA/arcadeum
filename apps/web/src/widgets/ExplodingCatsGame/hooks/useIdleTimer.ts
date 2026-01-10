'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { IDLE_TIMER_DURATION_SEC } from '@/shared/config/game';

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
  isRunning: boolean;
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

  // Reset timer when turn changes, enabled state changes, or action potential changes
  useEffect(() => {
    if (enabled && isMyTurn) {
      // Defer reset to next tick to avoid synchronous setState in effect
      const timeoutId = setTimeout(() => reset(), 0);
      return () => clearTimeout(timeoutId);
    }
  }, [enabled, isMyTurn, canAct, reset]);

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
      setSecondsRemaining((prev) => {
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
    isActive: enabled && isMyTurn,
    isRunning: !!shouldRun,
    reset,
  };
}
