import { apiClient, ApiClientOptions } from '@/shared/lib/api-client';
import type { ReplayDetail, ReplaySummary } from './lib/types';

interface ListReplaysParams {
  gameId?: string;
  page?: number;
  limit?: number;
}

interface ListReplaysResponse {
  entries: ReplaySummary[];
  total: number;
  hasMore: boolean;
}

export const replayApi = {
  getReplay: async (
    replayId: string,
    options?: ApiClientOptions,
  ): Promise<ReplayDetail> => {
    const data = await apiClient.get<{ replay: ReplayDetail }>(
      `/games/replays/${encodeURIComponent(replayId)}`,
      options,
    );
    return data.replay;
  },

  listReplays: async (
    params: ListReplaysParams = {},
    options?: ApiClientOptions,
  ): Promise<ListReplaysResponse> => {
    const queryParams = new URLSearchParams();

    if (params.gameId) queryParams.append('gameId', params.gameId);
    if (params.page !== undefined)
      queryParams.append('page', String(params.page));
    if (params.limit !== undefined)
      queryParams.append('limit', String(params.limit));

    const qs = queryParams.toString();
    return apiClient.get<ListReplaysResponse>(
      `/games/replays${qs ? `?${qs}` : ''}`,
      options,
    );
  },

  listMyReplays: async (
    params: ListReplaysParams = {},
    options?: ApiClientOptions,
  ): Promise<ListReplaysResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined)
      queryParams.append('page', String(params.page));
    if (params.limit !== undefined)
      queryParams.append('limit', String(params.limit));

    const qs = queryParams.toString();
    return apiClient.get<ListReplaysResponse>(
      `/games/replays/mine${qs ? `?${qs}` : ''}`,
      options,
    );
  },

  getReplayByRoom: async (
    roomId: string,
    options?: ApiClientOptions,
  ): Promise<ReplaySummary | null> => {
    try {
      const data = await apiClient.get<{ replay: ReplaySummary }>(
        `/games/replays/by-room/${encodeURIComponent(roomId)}`,
        options,
      );
      return data.replay;
    } catch {
      return null;
    }
  },
};
