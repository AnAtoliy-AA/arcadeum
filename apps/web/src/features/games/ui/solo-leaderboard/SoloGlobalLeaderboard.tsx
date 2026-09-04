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

function getRankBadge(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
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
      <div className="py-6 text-center text-sm text-[var(--textSecondary)]">
        {t('games.soloLeaderboard.loading')}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-[var(--textSecondary)]">
        {t('games.soloLeaderboard.noEntries')}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-[2.5rem_1fr_4rem_4rem_4rem] gap-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--textSecondary)]">
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

      {/* Entries */}
      {entries.map((entry) => {
        const isMe = currentUserId && entry.playerId === currentUserId;
        return (
          <div
            key={entry.playerId}
            className={cx(
              'grid grid-cols-[2.5rem_1fr_4rem_4rem_4rem] items-center gap-2 rounded-xl border px-2 py-2 transition-all',
              isMe
                ? 'border-[var(--primary)]/40 bg-[var(--primary)]/10'
                : 'border-[var(--glassBorder)] bg-[var(--backgroundHover)] hover:border-[var(--glassBorderStrong)]',
            )}
          >
            <span
              className={cx(
                'text-sm font-bold',
                entry.rank <= 3
                  ? 'text-lg'
                  : 'text-xs text-[var(--textSecondary)]',
              )}
            >
              {getRankBadge(entry.rank)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--color)]">
                {entry.displayName || entry.username}
              </p>
            </div>
            <span className="text-right text-sm font-bold tabular-nums text-[var(--color)]">
              {sortBy === 'durationMs'
                ? formatDuration(entry.score)
                : entry.score.toLocaleString()}
            </span>
            <span className="text-right text-xs tabular-nums text-[var(--textSecondary)]">
              {entry.moves}
            </span>
            <span className="text-right text-xs tabular-nums text-[var(--textSecondary)]">
              {formatDuration(entry.durationMs)}
            </span>
          </div>
        );
      })}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg bg-[var(--backgroundHover)] px-3 py-1.5 text-xs font-medium text-[var(--color)] transition-colors hover:bg-[var(--background)] disabled:opacity-40"
          >
            {t('games.soloLeaderboard.prev')}
          </button>
          <span className="text-xs text-[var(--textSecondary)]">
            {t('games.soloLeaderboard.page', {
              current: page + 1,
              total: totalPages,
            })}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-lg bg-[var(--backgroundHover)] px-3 py-1.5 text-xs font-medium text-[var(--color)] transition-colors hover:bg-[var(--background)] disabled:opacity-40"
          >
            {t('games.soloLeaderboard.next')}
          </button>
        </div>
      )}
    </div>
  );
}
