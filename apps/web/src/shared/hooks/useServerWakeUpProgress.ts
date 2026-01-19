import { useState, useEffect, useRef } from 'react';

const LONG_PENDING_THRESHOLD_MS = 2000;
const ESTIMATED_WAKE_TIME_SECONDS = 30;

export function useServerWakeUpProgress(isBusy: boolean) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isLongPending, setIsLongPending] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isBusy) {
      return;
    }

    // Set start time when action begins
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }

    const interval = setInterval(() => {
      if (startTimeRef.current === null) return;
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);

      setElapsedSeconds(elapsed);
      setIsLongPending(now - startTimeRef.current >= LONG_PENDING_THRESHOLD_MS);
    }, 1000);

    return () => {
      clearInterval(interval);
      // Reset state when busy state ends or component unmounts
      startTimeRef.current = null;
      setElapsedSeconds(0);
      setIsLongPending(false);
    };
  }, [isBusy]);

  const progress = Math.min(
    99,
    Math.round((elapsedSeconds / ESTIMATED_WAKE_TIME_SECONDS) * 100),
  );

  return {
    isLongPending,
    progress,
    elapsedSeconds,
  };
}
