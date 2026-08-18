import { apiClient, type ApiClientOptions } from '@/shared/lib/api-client';
import type { MyRanking, RankingSnapshot } from './model/types';

function isRankingSnapshot(data: unknown): data is RankingSnapshot {
  return (
    typeof data === 'object' &&
    data !== null &&
    'entries' in data &&
    Array.isArray((data as { entries: unknown }).entries)
  );
}

function isMyRankings(data: unknown): data is MyRanking[] {
  return Array.isArray(data) && data.every((row) => typeof row === 'object');
}

export const rankingApi = {
  getRankings: async (
    gameId: string,
    options?: ApiClientOptions,
  ): Promise<RankingSnapshot> => {
    try {
      const data = await apiClient.get<unknown>(
        `/rankings/${encodeURIComponent(gameId)}?limit=50`,
        options,
      );
      if (isRankingSnapshot(data)) return data;
    } catch {
      // fall through to empty snapshot
    }
    return { gameId, season: '', total: 0, entries: [] };
  },

  getMyRankings: async (options?: ApiClientOptions): Promise<MyRanking[]> => {
    try {
      const data = await apiClient.get<unknown>('/rankings/me', options);
      if (isMyRankings(data)) return data;
    } catch {
      // fall through to empty list
    }
    return [];
  },
};
