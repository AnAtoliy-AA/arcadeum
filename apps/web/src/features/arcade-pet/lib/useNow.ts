'use client';

import { useEffect, useState } from 'react';

const DEFAULT_REFRESH_MS = 60_000;

/**
 * Shared clock: the current timestamp, re-derived when the tab regains focus
 * or becomes visible and on a slow interval, so time-dependent UI (for
 * example the daily bonus after midnight) never freezes at its mount time.
 */
export function useNow(refreshMs: number = DEFAULT_REFRESH_MS): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const refresh = () => setNow(Date.now());
    refresh();
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    const timer = window.setInterval(refresh, refreshMs);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      window.clearInterval(timer);
    };
  }, [refreshMs]);

  return now;
}
