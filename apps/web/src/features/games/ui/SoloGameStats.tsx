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
  isPaused: boolean = false,
): { elapsedMs: number; formatted: string } {
  const [elapsedMs, setElapsedMs] = useState(0);
  const hiddenAtRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number | null>(null);
  const pausedMsRef = useRef(0);

  useEffect(() => {
    pausedMsRef.current = 0;
    pausedAtRef.current = null;
    hiddenAtRef.current = null;
  }, [startedAt]);

  useEffect(() => {
    if (isPaused) {
      if (pausedAtRef.current === null) {
        pausedAtRef.current = Date.now();
      }
    } else if (pausedAtRef.current !== null) {
      pausedMsRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
  }, [isPaused]);

  useEffect(() => {
    if (!isRunning) return undefined;

    const tick = () => {
      if (isPaused) return;
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
  }, [isRunning, startedAt, isPaused]);

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
        'flex items-center gap-1 rounded-md border px-1.5 sm:px-2 py-0.5 text-xs transition-colors shadow-xs select-none',
        highlight
          ? 'border-rose-500/40 bg-rose-500/15 text-rose-500'
          : 'border-[var(--glassBorder)] bg-[var(--backgroundHover)] hover:border-[var(--glassBorderStrong)]',
      )}
    >
      {icon && (
        <span className="text-[11px] leading-none opacity-80 select-none">
          {icon}
        </span>
      )}
      <span className="hidden sm:inline text-[9px] font-bold uppercase tracking-wider text-[var(--textSecondary)] select-none">
        {label}
      </span>
      <span className="font-mono text-xs font-black tabular-nums text-[var(--color)]">
        {value}
      </span>
    </div>
  );
}
