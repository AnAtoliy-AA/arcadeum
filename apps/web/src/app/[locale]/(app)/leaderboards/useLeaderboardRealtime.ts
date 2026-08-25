'use client';
import { useCallback, useEffect, useState } from 'react';
import {
  connectLeaderboardSocket,
  useLeaderboardSocket,
} from '@/shared/lib/socket';
import type {
  GameMode,
  LeaderboardPlayer,
} from '@/entities/leaderboard/model/types';

interface LeaderboardEntryUpdatePayload {
  userId?: string;
  mode?: GameMode;
  isInMatch?: boolean;
  rating?: number;
}

interface UseLeaderboardRealtimeArgs {
  accessToken?: string;
  enabled: boolean;
  page: number;
  refetch: () => Promise<unknown>;
  mode: GameMode;
  setAccumulated: React.Dispatch<React.SetStateAction<LeaderboardPlayer[]>>;
}

/**
 * Page-scoped realtime wiring for the leaderboards namespace: connects the
 * socket while mounted and keeps LIVE chips / freshness in sync.
 *
 * Bug #6: stable handlers via useCallback so the socket subscription
 * doesn't re-bind on every render.
 */
export function useLeaderboardRealtime({
  accessToken,
  enabled,
  page,
  refetch,
  mode,
  setAccumulated,
}: UseLeaderboardRealtimeArgs): number {
  const [freshnessPulseKey, setFreshnessPulseKey] = useState(0);

  // Only the leaderboards namespace socket connects on this route, and it
  // tears down on unmount so background pings don't follow the user to
  // other pages.
  useEffect(() => {
    if (!enabled) return;
    return connectLeaderboardSocket(accessToken ?? null);
  }, [accessToken, enabled]);

  const handleCaptured = useCallback(() => {
    setFreshnessPulseKey((k) => k + 1);
    if (page === 1) {
      refetch().catch((err: unknown) => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[leaderboards] refetch on capture failed', err);
        }
      });
    }
  }, [page, refetch]);
  useLeaderboardSocket('leaderboards.captured', handleCaptured);

  const applyEntryUpdate = useCallback(
    (update: LeaderboardEntryUpdatePayload | undefined) => {
      if (!update?.userId) return;
      if (update.mode && update.mode !== mode) return;
      setAccumulated((prev) =>
        prev.map((p) =>
          p.id === update.userId
            ? {
                ...p,
                isInMatch: update.isInMatch ?? p.isInMatch,
                rating: update.rating ?? p.rating,
              }
            : p,
        ),
      );
    },
    [mode, setAccumulated],
  );

  const handleEntryUpdated = useCallback(
    (...args: unknown[]) => {
      applyEntryUpdate(args[0] as LeaderboardEntryUpdatePayload | undefined);
    },
    [applyEntryUpdate],
  );
  useLeaderboardSocket('leaderboards.entry.updated', handleEntryUpdated);

  // Batched variant: the backend coalesces markInMatch updates into a single
  // emission instead of fanning out one namespace broadcast per user.
  const handleEntriesUpdated = useCallback(
    (...args: unknown[]) => {
      const payload = args[0] as { updates?: unknown } | undefined;
      if (!Array.isArray(payload?.updates)) return;
      for (const update of payload.updates) {
        applyEntryUpdate(update as LeaderboardEntryUpdatePayload);
      }
    },
    [applyEntryUpdate],
  );
  useLeaderboardSocket('leaderboards.entries.updated', handleEntriesUpdated);

  return freshnessPulseKey;
}
