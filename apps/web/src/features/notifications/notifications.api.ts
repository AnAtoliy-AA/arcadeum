import { apiClient } from '@/shared/lib/api-client';
import type {
  CreateSubscriptionPayload,
  ListInboxOptions,
  NotificationDto,
  NotificationPreferences,
  UnreadCountResponse,
  VapidPublicKeyResponse,
} from './notifications.types';

const BASE = '/notifications';

export const notificationsApi = {
  getVapidPublicKey(token?: string): Promise<VapidPublicKeyResponse> {
    return apiClient.fetch<VapidPublicKeyResponse>(`${BASE}/vapid-public-key`, {
      token,
    });
  },

  addSubscription(
    payload: CreateSubscriptionPayload,
    token: string,
  ): Promise<void> {
    return apiClient.fetch<void>(`${BASE}/subscriptions`, {
      method: 'POST',
      data: payload as unknown as Record<string, unknown>,
      token,
    });
  },

  removeSubscription(endpoint: string, token: string): Promise<void> {
    return apiClient.fetch<void>(`${BASE}/subscriptions`, {
      method: 'DELETE',
      data: { endpoint } as Record<string, unknown>,
      token,
    });
  },

  getPreferences(token: string): Promise<NotificationPreferences> {
    return apiClient.fetch<NotificationPreferences>(`${BASE}/preferences`, {
      token,
    });
  },

  updatePreferences(
    partial: Partial<NotificationPreferences>,
    token: string,
  ): Promise<NotificationPreferences> {
    return apiClient.fetch<NotificationPreferences>(`${BASE}/preferences`, {
      method: 'PUT',
      data: partial as unknown as Record<string, unknown>,
      token,
    });
  },

  listInbox(
    token: string,
    options: ListInboxOptions = {},
  ): Promise<NotificationDto[]> {
    const params = new URLSearchParams();
    if (options.limit !== undefined) params.set('limit', String(options.limit));
    if (options.before) params.set('before', options.before.toISOString());
    const qs = params.toString();
    return apiClient.fetch<NotificationDto[]>(`${BASE}${qs ? `?${qs}` : ''}`, {
      token,
    });
  },

  unreadCount(token: string): Promise<UnreadCountResponse> {
    return apiClient.fetch<UnreadCountResponse>(`${BASE}/unread-count`, {
      token,
    });
  },

  markRead(
    body: { ids?: string[]; all?: boolean },
    token: string,
  ): Promise<void> {
    return apiClient.fetch<void>(`${BASE}/read`, {
      method: 'POST',
      data: body as unknown as Record<string, unknown>,
      token,
    });
  },
};
