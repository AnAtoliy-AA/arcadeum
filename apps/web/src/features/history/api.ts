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
