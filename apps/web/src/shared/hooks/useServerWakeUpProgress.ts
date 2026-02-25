import { useState, useEffect, useRef } from 'react';

const ESTIMATED_WAKE_TIME_SECONDS = 30; // seconds

function getThreshold(): number {
  const isPlaywrightTest =
    typeof window !== 'undefined' &&
    !!(window as unknown as { isPlaywright?: boolean }).isPlaywright;
  if (isPlaywrightTest) {
    return 0;
  }

  const isLocalhost =
    typeof window !== 'undefined' &&
    ['localhost', '127.0.0.1'].includes(window.location.hostname);

  const envValue = Number(process.env.NEXT_PUBLIC_DEV_WAKE_THRESHOLD_MS || '');
  if (Number.isFinite(envValue) && envValue >= 0) {
    return envValue;
  }
  return isLocalhost ? 10000 : 2000;
}

export function useServerWakeUpProgress(isBusy: boolean) {
  const threshold = getThreshold();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isOverThreshold, setIsOverThreshold] = useState(
    isBusy && threshold === 0,
  );
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
      setIsOverThreshold(now - startTimeRef.current >= threshold);
    }, 1000);

    return () => {
      clearInterval(interval);
      // Reset state when busy state ends or component unmounts
      startTimeRef.current = null;
      setElapsedSeconds(0);
      setIsOverThreshold(false);
    };
  }, [isBusy, threshold]);

  const progress = Math.min(
    99,
    Math.round((elapsedSeconds / ESTIMATED_WAKE_TIME_SECONDS) * 100),
  );

  return {
    isOverThreshold,
    isLongPending: isOverThreshold,
    progress,
    elapsedSeconds,
  };
}
