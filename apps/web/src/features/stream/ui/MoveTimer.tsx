'use client';

import { useEffect, useState } from 'react';

function format(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * Seconds since the position last changed, ticking once per second. It is
 * the only part of the overlay that re-renders on a timer, so the rest of
 * the tree stays still between moves (no layout shift, minimal repaint).
 */
export function MoveTimer({ since }: { since: number }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [since]);

  return (
    <span data-testid="overlay-move-timer" className="tabular-nums">
      {format((now - since) / 1000)}
    </span>
  );
}
