import { ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

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
  className?: string;
}

export function GameResultStatsGrid({
  stats,
  className,
}: GameResultStatsGridProps) {
  const items: GameStatItem[] = [];

  if (stats.duration !== undefined) {
    items.push({
      id: 'duration',
      label: 'Duration',
      value:
        typeof stats.duration === 'number'
          ? `${Math.floor(stats.duration / 60)}:${String(stats.duration % 60).padStart(2, '0')}`
          : stats.duration,
    });
  }

  if (stats.turns !== undefined) {
    items.push({
      id: 'turns',
      label: 'Turns / Moves',
      value: stats.turns,
    });
  }

  if (stats.score !== undefined) {
    items.push({
      id: 'score',
      label: 'Score',
      value: stats.score,
    });
  }

  if (stats.accuracy !== undefined) {
    items.push({
      id: 'accuracy',
      label: 'Accuracy',
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
          className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-black/30 p-2.5 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-black/40"
        >
          {item.icon && <div className="mb-1 text-white/70">{item.icon}</div>}
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {item.label}
          </span>
          <span className="text-base font-bold tabular-nums text-white">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
