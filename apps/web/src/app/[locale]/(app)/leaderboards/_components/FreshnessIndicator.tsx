import { useSyncExternalStore } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import type { PageTranslations } from '@/shared/i18n/page-translations';

const STALE_MS = 30_000;

const subscribeTick = (callback: () => void) => {
  const id = setInterval(callback, 5_000);
  return () => clearInterval(id);
};

const getNowSnapshot = () => Date.now();
const getServerSnapshot = () => 0;

function formatAgo(deltaMs: number, t?: PageTranslations): string {
  const tt = (t?.freshness ?? {}) as Record<string, string | undefined>;
  if (deltaMs < 5_000) return tt.justNow ?? 'just now';
  if (deltaMs < 60_000) {
    return (tt.secondsAgo ?? '{n}s ago').replace(
      '{n}',
      String(Math.round(deltaMs / 1000)),
    );
  }
  if (deltaMs < 3_600_000) {
    return (tt.minutesAgo ?? '{n}m ago').replace(
      '{n}',
      String(Math.round(deltaMs / 60_000)),
    );
  }
  return (tt.hoursAgo ?? '{n}h ago').replace(
    '{n}',
    String(Math.round(deltaMs / 3_600_000)),
  );
}

export function FreshnessIndicator({
  capturedAt,
  pulseKey,
  t,
}: {
  capturedAt?: string;
  pulseKey: number;
  t?: PageTranslations;
}) {
  const now = useSyncExternalStore(
    subscribeTick,
    getNowSnapshot,
    getServerSnapshot,
  );

  if (!capturedAt || now === 0) {
    return (
      <div
        className="flex flex-row items-center gap-2 h-5"
        data-testid="leaderboard-freshness"
        aria-hidden="true"
      />
    );
  }
  const captured = new Date(capturedAt).getTime();
  const delta = Math.max(0, now - captured);
  const stale = delta > STALE_MS;
  const tt = (t?.freshness ?? {}) as Record<string, string | undefined>;
  const updatedLabel = (tt.updatedAt ?? 'Updated {ago}').replace(
    '{ago}',
    formatAgo(delta, t),
  );

  return (
    <div
      className="flex flex-row items-center gap-2 h-5"
      data-testid="leaderboard-freshness"
      data-fresh={!stale}
    >
      <div className="relative flex items-center justify-center w-2 h-2">
        {pulseKey > 0 && (
          <span
            key={pulseKey}
            className="absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75 animate-ping"
            aria-hidden="true"
          />
        )}
        <span
          className={cx(
            'relative inline-flex rounded-full w-2 h-2',
            stale ? 'bg-[var(--textSecondary)]' : 'bg-[var(--success)]',
          )}
        />
      </div>
      <span className="text-xs tracking-wider opacity-90">{updatedLabel}</span>
    </div>
  );
}
