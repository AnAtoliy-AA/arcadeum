import { apiClient, type ApiClientOptions } from '@/shared/lib/api-client';
import type {
  GameNightEvent,
  GameNightEventDetail,
  EventStatus,
  RecordMatchPayload,
} from './model/types';

export const eventsApi = {
  getEvents: async (
    params?: { status?: EventStatus; limit?: number },
    options?: ApiClientOptions,
  ): Promise<GameNightEvent[]> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const query = searchParams.toString();
    return apiClient.get<GameNightEvent[]>(
      `/events${query ? `?${query}` : ''}`,
      options,
    );
  },

  getFeaturedEvent: async (
    options?: ApiClientOptions,
  ): Promise<GameNightEvent | null> => {
    return apiClient.get<GameNightEvent | null>('/events/featured', options);
  },

  getEventById: async (
    id: string,
    options?: ApiClientOptions,
  ): Promise<GameNightEventDetail> => {
    return apiClient.get<GameNightEventDetail>(`/events/${id}`, options);
  },

  joinEvent: async (
    id: string,
    options?: ApiClientOptions,
  ): Promise<GameNightEventDetail> => {
    return apiClient.post<GameNightEventDetail>(
      `/events/${id}/join`,
      undefined,
      options,
    );
  },

  recordMatchResult: async (
    id: string,
    payload: RecordMatchPayload,
    options?: ApiClientOptions,
  ): Promise<GameNightEventDetail> => {
    return apiClient.post<GameNightEventDetail>(
      `/events/${id}/record-match`,
      payload,
      options,
    );
  },
};
