'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

const AUTO_PAUSE_STORAGE_KEY = 'arcadeum_solo_auto_pause';
const IDLE_THRESHOLD_MS = 45000;

export interface SoloPauseState {
  isPaused: boolean;
  isIdlePaused: boolean;
  autoPauseEnabled: boolean;
  togglePause: () => void;
  resumeGame: () => void;
  toggleAutoPause: () => void;
}

export function useSoloPause(
  isRunning: boolean,
  finishedAt: number | null,
): SoloPauseState {
  const [isPaused, setIsPaused] = useState(false);
  const [isIdlePaused, setIsIdlePaused] = useState(false);
  const [autoPauseEnabled, setAutoPauseEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(AUTO_PAUSE_STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  });

  const lastActivityRef = useRef(0);

  const toggleAutoPause = useCallback(() => {
    setAutoPauseEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(AUTO_PAUSE_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      if (!prev) {
        setIsIdlePaused(false);
      } else {
        lastActivityRef.current = Date.now();
      }
      return !prev;
    });
  }, []);

  const resumeGame = useCallback(() => {
    setIsPaused(false);
    setIsIdlePaused(false);
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    lastActivityRef.current = Date.now();
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('pointerdown', updateActivity, { passive: true });
    window.addEventListener('pointermove', updateActivity, { passive: true });
    window.addEventListener('keydown', updateActivity, { passive: true });

    const interval = setInterval(() => {
      if (isRunning && finishedAt === null && !isPaused && autoPauseEnabled) {
        if (
          lastActivityRef.current > 0 &&
          Date.now() - lastActivityRef.current >= IDLE_THRESHOLD_MS
        ) {
          setIsPaused(true);
          setIsIdlePaused(true);
        }
      }
    }, 1000);

    return () => {
      window.removeEventListener('pointerdown', updateActivity);
      window.removeEventListener('pointermove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      clearInterval(interval);
    };
  }, [isRunning, finishedAt, isPaused, autoPauseEnabled]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (
        (e.key === 'p' || e.key === 'P') &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePause]);

  const effectivePaused = finishedAt === null && isPaused;
  const effectiveIdlePaused = finishedAt === null && isIdlePaused;

  return {
    isPaused: effectivePaused,
    isIdlePaused: effectiveIdlePaused,
    autoPauseEnabled,
    togglePause,
    resumeGame,
    toggleAutoPause,
  };
}
