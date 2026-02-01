import { apiClient, ApiClientOptions } from '@/shared/lib/api-client';
import { HttpStatus } from '@/shared/lib/http-status';
import { PAGINATION } from '@/shared/config/constants';
import type { HistorySummary, HistoryDetail } from '@/app/history/types';

interface GetHistoryParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface GetHistoryResponse {
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
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  hasMore: boolean;
  total: number;
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
  ): Promise<LeaderboardResponse> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));
    if (offset) params.append('offset', String(offset));
    if (gameId) params.append('gameId', gameId);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<LeaderboardResponse>(
      `/games/leaderboard${queryString}`,
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
};
