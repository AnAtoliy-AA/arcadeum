import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { GameResultStats } from '../GameResultStatsGrid';
import type { MoveEntry } from '../../hooks/usePostGameAnalytics';

interface PostGameHighlightsProps {
  stats?: GameResultStats | null;
  moveTimeline: MoveEntry[];
  currentUserId: string | null;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export function PostGameHighlights({
  stats,
  moveTimeline,
  currentUserId,
  t,
}: PostGameHighlightsProps) {
  const totalMoves = moveTimeline.length || stats?.turns || 0;
  const rawDuration = stats?.duration;
  const durationSec =
    typeof rawDuration === 'number'
      ? rawDuration
      : typeof rawDuration === 'string' && rawDuration.includes(':')
        ? rawDuration
            .split(':')
            .reduce((acc, time) => 60 * acc + (Number(time) || 0), 0)
        : undefined;

  const myMovesCount = currentUserId
    ? moveTimeline.filter((m) => m.playerId === currentUserId).length
    : 0;

  const avgPace =
    durationSec && totalMoves > 0
      ? (durationSec / totalMoves).toFixed(1)
      : null;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      <div className="rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--textSecondary)]">
          {t('games.table.analytics.highlights.pace')}
        </span>
        <p className="mt-1 font-mono text-sm font-bold text-emerald-400">
          {avgPace
            ? t('games.table.analytics.highlights.paceValue', {
                seconds: avgPace,
              })
            : `${totalMoves} moves`}
        </p>
      </div>

      <div className="rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--textSecondary)]">
          {t('games.table.analytics.highlights.efficiency')}
        </span>
        <p className="mt-1 text-sm font-bold text-indigo-400">
          {myMovesCount > 0
            ? `${myMovesCount} / ${totalMoves} actions`
            : t('games.table.analytics.highlights.dominant')}
        </p>
      </div>

      <div className="col-span-2 rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-2.5 sm:col-span-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--textSecondary)]">
          {t('games.table.analytics.highlights.title')}
        </span>
        <p className="mt-1 truncate text-sm font-bold text-amber-400">
          {stats?.accuracy
            ? `Accuracy: ${stats.accuracy}`
            : stats?.score !== undefined
              ? `Score: ${stats.score}`
              : t('games.table.analytics.highlights.movesCount', {
                  count: totalMoves,
                })}
        </p>
      </div>
    </div>
  );
}
