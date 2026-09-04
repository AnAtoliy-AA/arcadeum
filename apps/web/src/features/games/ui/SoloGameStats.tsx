import { useEffect, useRef, useState } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

export function formatDuration(durationMs: number): string {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function useSoloTimer(
  isRunning: boolean,
  startedAt: number,
): { elapsedMs: number; formatted: string } {
  const [elapsedMs, setElapsedMs] = useState(0);
  const hiddenAtRef = useRef<number | null>(null);
  const pausedMsRef = useRef(0);

  useEffect(() => {
    if (!isRunning) return undefined;

    const tick = () => {
      const hiddenBonus = hiddenAtRef.current
        ? Date.now() - hiddenAtRef.current
        : 0;
      const elapsed =
        Date.now() - startedAt - pausedMsRef.current - hiddenBonus;
      setElapsedMs(Math.max(0, elapsed));
    };
    tick();
    const interval = setInterval(tick, 1000);

    const handleVisibility = () => {
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
      } else if (hiddenAtRef.current !== null) {
        pausedMsRef.current += Date.now() - hiddenAtRef.current;
        hiddenAtRef.current = null;
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isRunning, startedAt]);

  return { elapsedMs, formatted: formatDuration(elapsedMs) };
}

export function StatCard({
  label,
  value,
  icon,
  highlight = false,
  dataTestId,
}: {
  label: string;
  value: string | number;
  icon?: string;
  highlight?: boolean;
  dataTestId?: string;
}) {
  return (
    <div
      data-testid={dataTestId}
      className={cx(
        'flex flex-col items-center justify-center rounded-xl border px-2.5 py-1.5 transition-all backdrop-blur-md sm:px-4 sm:py-2.5',
        highlight
          ? 'border-rose-500/40 bg-rose-500/15 text-rose-500 shadow-sm shadow-rose-500/20'
          : 'border-[var(--glassBorder)] bg-[var(--glassBg)] text-[var(--color)] shadow-sm hover:border-[var(--glassBorderStrong)]',
      )}
    >
      <div className="flex items-center gap-1">
        {icon && <span className="text-xs opacity-80">{icon}</span>}
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--textSecondary)]">
          {label}
        </span>
      </div>
      <span className="font-mono text-base font-black tabular-nums sm:text-xl">
        {value}
      </span>
    </div>
  );
}
