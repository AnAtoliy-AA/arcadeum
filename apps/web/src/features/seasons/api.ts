import { apiClient, type ApiClientOptions } from '@/shared/lib/api-client';
import type { SeasonBoardSnapshot, SeasonDetailView } from './model/types';

function isSeasonDetail(data: unknown): data is SeasonDetailView {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'startsAt' in data &&
    'endsAt' in data &&
    Array.isArray((data as { rewardTiers?: unknown }).rewardTiers)
  );
}

function isSeasonBoard(data: unknown): data is SeasonBoardSnapshot {
  return (
    typeof data === 'object' &&
    data !== null &&
    'seasonId' in data &&
    Array.isArray((data as { entries?: unknown }).entries)
  );
}

export const seasonsApi = {
  getCurrentSeason: async (
    options?: ApiClientOptions,
  ): Promise<SeasonDetailView | null> => {
    try {
      const data = await apiClient.get<unknown>('/seasons/current', options);
      if (isSeasonDetail(data)) return data;
    } catch {
      // fall through to empty result
    }
    return null;
  },

  getLeaderboard: async (
    seasonId: string,
    params?: { gameId?: string; limit?: number; offset?: number },
    options?: ApiClientOptions,
  ): Promise<SeasonBoardSnapshot> => {
    try {
      const searchParams = new URLSearchParams();
      if (params?.gameId) searchParams.set('gameId', params.gameId);
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.offset) searchParams.set('offset', String(params.offset));
      const query = searchParams.toString();
      const data = await apiClient.get<unknown>(
        `/seasons/${encodeURIComponent(seasonId)}/leaderboard${query ? `?${query}` : ''}`,
        options,
      );
      if (isSeasonBoard(data)) return data;
    } catch {
      // fall through to empty board
    }
    return { seasonId, gameId: params?.gameId ?? null, total: 0, entries: [] };
  },
};
