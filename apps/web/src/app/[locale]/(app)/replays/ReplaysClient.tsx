'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { replayApi } from '@/features/replay/api';
import { ReplayCard } from './ReplayCard';
import type { ReplaySummary } from '@/features/replay/lib/types';

const GAME_FILTERS = [
  { id: '', label: 'all' },
  { id: 'chess_v1', label: 'chess' },
  { id: 'checkers_v1', label: 'checkers' },
  { id: 'tic_tac_toe_v1', label: 'ticTacToe' },
  { id: 'backgammon_v1', label: 'backgammon' },
  { id: 'go_v1', label: 'go' },
] as const;

const PAGE_SIZE = 12;

export default function ReplaysClient() {
  const { t } = useTranslation();
  const [replays, setReplays] = useState<ReplaySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameFilter, setGameFilter] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await replayApi.listReplays({
          gameId: gameFilter || undefined,
          page,
          limit: PAGE_SIZE,
        });
        if (!cancelled) {
          setReplays(data.entries);
          setHasMore(data.hasMore);
          setTotal(data.total);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setReplays([]);
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [page, gameFilter]);

  const handleFilterChange = (filterId: string) => {
    setGameFilter(filterId);
    setPage(0);
    setLoading(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-white">
          {t('games.replay.list.title')}
        </h1>
        <span className="text-[13px] text-[rgba(255,255,255,0.4)]">
          {t('games.replay.list.total', { count: total })}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {GAME_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => handleFilterChange(filter.id)}
            className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 ${
              gameFilter === filter.id
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.1)]'
            }`}
          >
            {t(
              `games.replay.list.filter.${filter.label}` as Parameters<
                typeof t
              >[0],
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-[rgba(255,255,255,0.04)]"
            />
          ))}
        </div>
      ) : replays.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <span className="text-[48px]">🎬</span>
          <p className="text-[14px] text-[rgba(255,255,255,0.5)]">
            {t('games.replay.list.empty')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {replays.map((replay) => (
            <ReplayCard key={replay.replayId} replay={replay} t={t} />
          ))}
        </div>
      )}

      {!loading && replays.length > 0 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded-lg bg-[rgba(255,255,255,0.06)] px-4 py-2 text-[13px] font-medium text-[rgba(255,255,255,0.7)] transition-colors hover:bg-[rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            ← {t('games.replay.list.prev')}
          </button>
          <span className="text-[13px] text-[rgba(255,255,255,0.5)]">
            {t('games.replay.list.page', {
              current: page + 1,
              total: Math.max(1, Math.ceil(total / PAGE_SIZE)),
            })}
          </span>
          <button
            type="button"
            disabled={!hasMore}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg bg-[rgba(255,255,255,0.06)] px-4 py-2 text-[13px] font-medium text-[rgba(255,255,255,0.7)] transition-colors hover:bg-[rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            {t('games.replay.list.next')} →
          </button>
        </div>
      )}
    </div>
  );
}
