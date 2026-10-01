import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { soloActiveTimer } from '@/features/games/lib/soloActiveTimer';

export function formatDuration(durationMs: number): string {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function subscribeSoloTimer(listener: () => void): () => void {
  return soloActiveTimer.subscribe(listener);
}

/**
 * Elapsed active-play time for a solo game. Delegates accounting to the shared
 * `soloActiveTimer` so the HUD and the recorded/leaderboard duration are the
 * same number: pause, hidden tab, blocking overlays and time away from the
 * page are all excluded.
 */
export function useSoloTimer(
  isRunning: boolean,
  startedAt: number,
  isPaused: boolean = false,
): { elapsedMs: number; formatted: string } {
  const getSnapshot = useCallback(
    () => soloActiveTimer.getSnapshotFor(startedAt),
    [startedAt],
  );
  const elapsedMs = useSyncExternalStore(
    subscribeSoloTimer,
    getSnapshot,
    getSnapshot,
  );

  useEffect(() => {
    soloActiveTimer.setPaused(isPaused);
  }, [isPaused]);

  useEffect(() => {
    if (!isRunning) return undefined;
    soloActiveTimer.start(startedAt);
    return () => soloActiveTimer.stop();
  }, [isRunning, startedAt]);

  return { elapsedMs, formatted: formatDuration(elapsedMs) };
}

/**
 * Freezes the shared solo timer while a non-gameplay overlay (rules modal) is
 * open, so overlay time never lands in the HUD or the leaderboard duration.
 */
export function useSoloTimerBlocked(blocked: boolean): void {
  useEffect(() => {
    soloActiveTimer.setBlocked(blocked);
    return () => soloActiveTimer.setBlocked(false);
  }, [blocked]);
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
