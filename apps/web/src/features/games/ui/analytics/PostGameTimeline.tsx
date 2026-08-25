'use client';

import { useState } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { MoveEntry } from '../../hooks/usePostGameAnalytics';
import type { GameResultStats } from '../GameResultStatsGrid';
import { PostGameHighlights } from './PostGameHighlights';

type TimelineFilter = 'all' | 'mine' | 'opponent';

interface PostGameTimelineProps {
  stats?: GameResultStats | null;
  moveTimeline: MoveEntry[];
  currentUserId: string | null;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export function PostGameTimeline({
  stats,
  moveTimeline,
  currentUserId,
  t,
}: PostGameTimelineProps) {
  const [filter, setFilter] = useState<TimelineFilter>('all');

  const filteredMoves = moveTimeline.filter((entry) => {
    if (filter === 'mine') return entry.playerId === currentUserId;
    if (filter === 'opponent') return entry.playerId !== currentUserId;
    return true;
  });

  return (
    <div className="flex flex-col gap-3">
      <PostGameHighlights
        stats={stats}
        moveTimeline={moveTimeline}
        currentUserId={currentUserId}
        t={t}
      />

      {moveTimeline.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
              {t('games.table.analytics.moves.title')}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={cx(
                  'rounded-md px-2 py-0.5 text-[10px] font-semibold transition-all',
                  filter === 'all'
                    ? 'bg-white/20 text-white'
                    : 'text-white/40 hover:bg-white/5 hover:text-white/70',
                )}
              >
                {t('games.table.analytics.moves.filterAll')}
              </button>
              {currentUserId && (
                <>
                  <button
                    type="button"
                    onClick={() => setFilter('mine')}
                    className={cx(
                      'rounded-md px-2 py-0.5 text-[10px] font-semibold transition-all',
                      filter === 'mine'
                        ? 'bg-indigo-500/30 text-indigo-300'
                        : 'text-white/40 hover:bg-white/5 hover:text-white/70',
                    )}
                  >
                    {t('games.table.analytics.moves.filterMine')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter('opponent')}
                    className={cx(
                      'rounded-md px-2 py-0.5 text-[10px] font-semibold transition-all',
                      filter === 'opponent'
                        ? 'bg-rose-500/30 text-rose-300'
                        : 'text-white/40 hover:bg-white/5 hover:text-white/70',
                    )}
                  >
                    {t('games.table.analytics.moves.filterOpponent')}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex max-h-[220px] flex-col gap-1.5 overflow-y-auto pr-1">
            {filteredMoves.length === 0 ? (
              <div className="py-4 text-center text-xs text-white/40">
                {t('games.table.analytics.moves.empty')}
              </div>
            ) : (
              filteredMoves.map((entry, idx) => {
                const isCurrent = entry.playerId === currentUserId;
                return (
                  <div
                    key={`${entry.turn}-${entry.playerId}-${idx}`}
                    className={cx(
                      'flex items-center gap-2.5 rounded-xl border px-3 py-2 text-[12px] transition-colors',
                      isCurrent
                        ? 'border-indigo-500/20 bg-indigo-950/20 text-white/90'
                        : 'border-white/5 bg-black/20 text-white/60',
                    )}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-[10px] font-bold text-white/70">
                      {entry.turn}
                    </span>
                    <span className="flex-1 truncate">{entry.description}</span>
                    <span
                      className={cx(
                        'text-[10px] font-semibold uppercase tracking-wider',
                        isCurrent ? 'text-indigo-400' : 'text-slate-400',
                      )}
                    >
                      {isCurrent
                        ? t('games.table.analytics.moves.filterMine')
                        : t('games.table.analytics.moves.filterOpponent')}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 py-4">
          <span className="text-2xl">🎯</span>
          <p className="text-center text-[13px] text-white/50">
            {t('games.table.analytics.moves.empty')}
          </p>
        </div>
      )}
    </div>
  );
}
