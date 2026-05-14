'use client';

import { useEffect, useState } from 'react';

/**
 * True while the viewport is ≤480px — phones in portrait. Used to gate
 * widget-mode mobile branches that the tamagui `sm` breakpoint (≤800px)
 * fires too eagerly for. SSR-safe: returns `false` on the server and
 * during first paint, then syncs on mount.
 */
export function useNarrowViewport(maxWidth = 480): boolean {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [maxWidth]);
  return narrow;
}
