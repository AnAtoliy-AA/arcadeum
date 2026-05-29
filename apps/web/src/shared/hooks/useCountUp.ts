'use client';

import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Animates a number toward `target`, counting up/down with an ease-out curve.
 * Returns the current displayed value (integer-rounded). The first render snaps
 * to `target` (no intro animation); subsequent changes animate. Honors
 * `prefers-reduced-motion` by jumping straight to the target.
 *
 * All state writes happen inside `requestAnimationFrame` callbacks so the hook
 * never mutates state or refs during render.
 *
 * Reusable across the wallet balance, reward payouts, and reward deltas.
 */
export function useCountUp(target: number, durationMs = 700): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const isFirst = useRef(true);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;

    // First render already initialized state to `target` — just record it.
    if (isFirst.current) {
      isFirst.current = false;
      fromRef.current = target;
      return;
    }

    // Nothing to animate, or motion is reduced: snap on the next frame.
    if (prefersReducedMotion() || durationMs <= 0 || target === from) {
      fromRef.current = target;
      const id = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(id);
    }

    const delta = target - from;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      setValue(
        progress >= 1
          ? target
          : Math.round(from + delta * easeOutCubic(progress)),
      );
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
      }
    };
    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, durationMs]);

  return value;
}
