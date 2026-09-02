import { ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import type { TranslationKey } from '@/shared/lib/useTranslation';

export interface GameStatItem {
  id: string;
  label: string;
  value: string | number;
  icon?: ReactNode;
}

export interface GameResultStats {
  duration?: string | number;
  turns?: number;
  score?: number;
  accuracy?: string;
  customStats?: GameStatItem[];
}

interface GameResultStatsGridProps {
  stats: GameResultStats;
  t?: (key: TranslationKey) => string;
  className?: string;
}

function getLabel(
  t: ((key: TranslationKey) => string) | undefined,
  key: TranslationKey,
  fallback: string,
): string {
  if (!t) return fallback;
  const translated = t(key);
  return translated && translated !== key ? translated : fallback;
}

export function GameResultStatsGrid({
  stats,
  t,
  className,
}: GameResultStatsGridProps) {
  const items: GameStatItem[] = [];

  if (stats.duration !== undefined) {
    items.push({
      id: 'duration',
      label: getLabel(
        t,
        'games.table.stats.duration' as TranslationKey,
        'Duration',
      ),
      value:
        typeof stats.duration === 'number'
          ? `${Math.floor(stats.duration / 60)}:${String(stats.duration % 60).padStart(2, '0')}`
          : stats.duration,
    });
  }

  if (stats.turns !== undefined) {
    items.push({
      id: 'turns',
      label: getLabel(
        t,
        'games.table.stats.turns' as TranslationKey,
        'Turns / Moves',
      ),
      value: stats.turns,
    });
  }

  if (stats.score !== undefined) {
    items.push({
      id: 'score',
      label: getLabel(t, 'games.table.stats.score' as TranslationKey, 'Score'),
      value: stats.score,
    });
  }

  if (stats.accuracy !== undefined) {
    items.push({
      id: 'accuracy',
      label: getLabel(
        t,
        'games.table.stats.accuracy' as TranslationKey,
        'Accuracy',
      ),
      value: stats.accuracy,
    });
  }

  if (stats.customStats && stats.customStats.length > 0) {
    items.push(...stats.customStats);
  }

  if (items.length === 0) return null;

  return (
    <div
      data-testid="game-result-stats-grid"
      className={cx(
        'grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3',
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-col items-center justify-center rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] p-2.5 backdrop-blur-md transition-all duration-300 hover:border-[var(--glassBorderStrong)]"
        >
          {item.icon && (
            <div className="mb-1 text-[var(--textSecondary)]">{item.icon}</div>
          )}
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--textSecondary)]">
            {item.label}
          </span>
          <span className="text-base font-bold tabular-nums text-[var(--color)]">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
