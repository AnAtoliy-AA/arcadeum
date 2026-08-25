import { apiClient, ApiClientOptions } from '@/shared/lib/api-client';
import { HttpStatus } from '@/shared/lib/http-status';
import { PAGINATION } from '@/shared/config/constants';
import type {
  HistorySummary,
  HistoryDetail,
} from '@/app/[locale]/(app)/history/types';

interface GetHistoryParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  grouped?: boolean;
}

export interface GetHistoryResponse {
  entries: HistorySummary[];
  total: number;
  hasMore: boolean;
  page: number;
}

interface RematchResponse {
  room: {
    id: string;
  };
}

export interface GameTypeStats {
  gameId: string;
  totalGames: number;
  wins: number;
  winRate: number;
}

export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  byGameType: GameTypeStats[];
  currentStreak: number;
  currentStreakType: 'won' | 'lost' | null;
  bestWinStreak: number;
  favoriteGame: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  equippedAvatarId?: string | null;
  equippedBadgeId?: string | null;
  equippedNameColorId?: string | null;
  equippedFrameId?: string | null;
  equippedAuraId?: string | null;
  equippedBannerId?: string | null;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  hasMore: boolean;
  total: number;
}

export interface HeadToHeadResponse {
  player1: { wins: number; losses: number; draws: number };
  player2: { wins: number; losses: number; draws: number };
  totalGames: number;
}

export interface TrendsResponse {
  records: Array<{
    result: 'won' | 'lost' | 'draw';
    timestamp: number;
    sessionId: string;
  }>;
  winRate: number;
  currentStreak: number;
  currentStreakType: 'won' | 'lost' | null;
}

export const historyApi = {
  getHistory: async (
    params: GetHistoryParams = {},
    options?: ApiClientOptions,
  ): Promise<GetHistoryResponse> => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === '' ||
        value === 'all'
      ) {
        return;
      }
      queryParams.append(key, String(value));
    });

    // Default limit if not provided, consistent with hook default
    if (!params.limit) {
      queryParams.append('limit', String(PAGINATION.DEFAULT_PAGE_SIZE));
    }

    return apiClient.get<GetHistoryResponse>(
      `/games/history?${queryParams.toString()}`,
      options,
    );
  },

  getStats: async (options?: ApiClientOptions): Promise<PlayerStats> => {
    return apiClient.get<PlayerStats>('/games/stats', options);
  },

  getLeaderboard: async (
    limit?: number,
    offset?: number,
    gameId?: string,
    options?: ApiClientOptions,
  ): Promise<LeaderboardResponse> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));
    if (offset !== undefined) params.append('offset', String(offset));
    if (gameId) params.append('gameId', gameId);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<LeaderboardResponse>(
      `/games/leaderboard${queryString}`,
      options,
    );
  },

  getDetail: async (
    roomId: string,
    options?: ApiClientOptions,
  ): Promise<HistoryDetail> => {
    try {
      return await apiClient.get<HistoryDetail>(
        `/games/history/${encodeURIComponent(roomId)}`,
        options,
      );
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'status' in err) {
        const status = (err as { status: number }).status;
        if (status === HttpStatus.NOT_FOUND) {
          throw new Error('history_detail_removed_error');
        }
      }
      throw err;
    }
  },

  rematch: async (
    roomId: string,
    participantIds: string[],
    options?: ApiClientOptions,
  ): Promise<RematchResponse> => {
    return apiClient.post<RematchResponse>(
      `/games/history/${encodeURIComponent(roomId)}/rematch`,
      { participantIds },
      options,
    );
  },

  remove: async (roomId: string, options?: ApiClientOptions): Promise<void> => {
    return apiClient.delete(
      `/games/history/${encodeURIComponent(roomId)}`,
      options,
    );
  },

  syncStats: async (
    records: Array<{
      gameId: string;
      result: 'won' | 'lost' | 'draw';
      timestamp: number;
      sessionId: string;
    }>,
    options?: ApiClientOptions,
  ): Promise<{ synced: number; duplicates: number }> => {
    return apiClient.post<{ synced: number; duplicates: number }>(
      '/games/stats',
      { records },
      options,
    );
  },

  getHeadToHead: async (
    userId2: string,
    gameId?: string,
    options?: ApiClientOptions,
  ): Promise<HeadToHeadResponse> => {
    const params = new URLSearchParams();
    params.append('userId2', userId2);
    if (gameId) params.append('gameId', gameId);
    return apiClient.get<HeadToHeadResponse>(
      `/games/stats/head-to-head?${params.toString()}`,
      options,
    );
  },

  getTrends: async (
    gameId?: string,
    limit = 10,
    options?: ApiClientOptions,
  ): Promise<TrendsResponse> => {
    const params = new URLSearchParams();
    if (gameId) params.append('gameId', gameId);
    params.append('limit', String(limit));
    return apiClient.get<TrendsResponse>(
      `/games/stats/trends?${params.toString()}`,
      options,
    );
  },
};
