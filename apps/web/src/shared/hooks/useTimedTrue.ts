import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * A hook that manages a temporary boolean state (e.g. for "Copied!" feedback).
 * Uses requestAnimationFrame instead of setTimeout to follow project constraints.
 *
 * @param duration Duration in milliseconds to keep the state as true.
 * @returns [value, trigger] where trigger sets value to true for context.
 */
export function useTimedTrue(duration: number = 2000) {
  const [value, setValue] = useState(false);
  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const stopTimer = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  const trigger = useCallback(() => {
    setValue(true);
    stopTimer();

    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      if (
        startTimeRef.current !== null &&
        now - startTimeRef.current >= duration
      ) {
        setValue(false);
        stopTimer();
      } else {
        rafIdRef.current = requestAnimationFrame(tick);
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);
  }, [duration, stopTimer]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  return [value, trigger] as const;
}
