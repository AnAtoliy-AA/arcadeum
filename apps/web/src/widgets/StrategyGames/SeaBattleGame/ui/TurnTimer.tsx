'use client';

import { useState, useEffect } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

/**
 * Countdown timer for Speed mode. Counts down to a server-side deadline.
 * Styled to match the shared GameIdleTimer for visual consistency.
 */
export function TurnTimer({ deadline }: { deadline?: number }) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(() => {
    if (!deadline) return null;
    return Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!deadline) return;
    const update = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };
    update();
    const id = setInterval(update, 250);
    return () => clearInterval(id);
  }, [deadline]);

  if (secondsLeft === null) return null;

  const critical = secondsLeft <= 5;
  const urgent = secondsLeft <= 10;

  return (
    <div className="my-1">
      <div
        className={cx(
          'flex flex-row items-center justify-center gap-2 rounded-lg border px-4 py-[10px]',
          critical
            ? 'border-[rgba(239,68,68,0.5)] bg-[rgba(239,68,68,0.15)]'
            : urgent
              ? 'border-[rgba(251,191,36,0.4)] bg-[rgba(251,191,36,0.15)]'
              : 'border-[rgba(156,163,175,0.3)] bg-[rgba(156,163,175,0.1)]',
        )}
      >
        <span className="text-[18px]">⏱️</span>
        <span
          className={cx(
            'text-[14px] leading-[18px] font-semibold',
            critical
              ? 'text-[rgb(239,68,68)] animate-pulse'
              : urgent
                ? 'text-[rgb(251,191,36)]'
                : 'text-[rgb(156,163,175)]',
          )}
        >
          {secondsLeft}s
        </span>
      </div>
    </div>
  );
}
