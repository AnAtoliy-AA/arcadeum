'use client';

import { useEffect, useState } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  soloScoresApi,
  type SoloLeaderboardEntry,
} from '@/shared/api/soloScores';

interface SoloGlobalLeaderboardProps {
  gameId: string;
  difficulty: string;
  sortBy?: 'score' | 'durationMs';
  order?: 'asc' | 'desc';
  currentUserId?: string;
  limit?: number;
}

function formatDuration(ms: number): string {
  if (ms === 0) return '--';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function useSoloLeaderboardData(
  gameId: string,
  difficulty: string,
  sortBy: 'score' | 'durationMs',
  order: 'asc' | 'desc',
  limit: number,
  page: number,
) {
  const [entries, setEntries] = useState<SoloLeaderboardEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const controller = new AbortController();

    soloScoresApi
      .getLeaderboard(gameId, difficulty, sortBy, order, limit, page * limit)
      .then((res) => {
        if (!cancelled) {
          setEntries(res.entries);
          setTotal(res.total);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEntries([]);
          setTotal(0);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [gameId, difficulty, sortBy, order, limit, page]);

  return { entries, total, loading };
}

export function SoloGlobalLeaderboard({
  gameId,
  difficulty,
  sortBy = 'score',
  order = 'desc',
  currentUserId,
  limit = 20,
}: SoloGlobalLeaderboardProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const { entries, total, loading } = useSoloLeaderboardData(
    gameId,
    difficulty,
    sortBy,
    order,
    limit,
    page,
  );

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return (
      <div className="flex flex-col gap-2 py-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-12 w-full animate-pulse rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)]/40"
          />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <span className="mb-2 text-3xl opacity-50">🏆</span>
        <p className="text-sm font-semibold text-[var(--textSecondary)]">
          {t('games.soloLeaderboard.noEntries')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[2.5rem_1fr_4rem_4rem_4rem] gap-2 px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--textSecondary)]">
        <span>#</span>
        <span>{t('games.soloLeaderboard.player')}</span>
        <span className="text-right">
          {sortBy === 'durationMs'
            ? t('games.soloLeaderboard.time')
            : t('games.soloLeaderboard.score')}
        </span>
        <span className="text-right">{t('games.soloLeaderboard.moves')}</span>
        <span className="text-right">{t('games.soloLeaderboard.time')}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        {entries.map((entry) => {
          const isMe = currentUserId && entry.playerId === currentUserId;
          const name = entry.displayName || entry.username;
          const initial = (name.charAt(0) || '?').toUpperCase();

          return (
            <div
              key={entry.playerId}
              className={cx(
                'grid grid-cols-[2.5rem_1fr_4rem_4rem_4rem] items-center gap-2 rounded-xl border px-3 py-2.5 transition-all duration-200',
                isMe
                  ? 'border-[var(--primary)]/50 bg-[var(--primary)]/10 shadow-sm shadow-[var(--primary)]/10'
                  : 'border-[var(--glassBorder)] bg-[var(--glassBg)] hover:border-[var(--glassBorderStrong)] hover:bg-[var(--backgroundHover)]',
              )}
            >
              <div className="flex items-center">
                {entry.rank === 1 ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/15 text-xs font-black text-amber-500 shadow-sm shadow-amber-500/30">
                    🥇
                  </span>
                ) : entry.rank === 2 ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-400/40 bg-slate-300/15 text-xs font-black text-slate-300">
                    🥈
                  </span>
                ) : entry.rank === 3 ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-amber-600/40 bg-amber-700/15 text-xs font-black text-amber-500">
                    🥉
                  </span>
                ) : (
                  <span className="font-mono text-xs font-bold text-[var(--textSecondary)]">
                    #{entry.rank}
                  </span>
                )}
              </div>

              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-[10px] font-black text-[var(--color)]">
                  {initial}
                </div>
                <p className="truncate text-xs sm:text-sm font-semibold text-[var(--color)]">
                  {name}
                </p>
                {isMe && (
                  <span className="shrink-0 rounded-full bg-[var(--primary)] px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                    YOU
                  </span>
                )}
              </div>

              <span className="text-right font-mono text-xs sm:text-sm font-black tabular-nums text-[var(--color)]">
                {sortBy === 'durationMs'
                  ? formatDuration(entry.score)
                  : entry.score.toLocaleString()}
              </span>
              <span className="text-right font-mono text-xs tabular-nums text-[var(--textSecondary)]">
                {entry.moves}
              </span>
              <span className="text-right font-mono text-xs tabular-nums text-[var(--textSecondary)]">
                {formatDuration(entry.durationMs)}
              </span>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 rounded-lg border border-[var(--glassBorder)] bg-[var(--backgroundHover)] px-3 py-1.5 text-xs font-semibold text-[var(--color)] transition-all hover:bg-[var(--glassBgHover)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← {t('games.soloLeaderboard.prev')}
          </button>
          <span className="font-mono text-xs font-medium text-[var(--textSecondary)]">
            {t('games.soloLeaderboard.page', {
              current: page + 1,
              total: totalPages,
            })}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 rounded-lg border border-[var(--glassBorder)] bg-[var(--backgroundHover)] px-3 py-1.5 text-xs font-semibold text-[var(--color)] transition-all hover:bg-[var(--glassBgHover)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t('games.soloLeaderboard.next')} →
          </button>
        </div>
      )}
    </div>
  );
}
