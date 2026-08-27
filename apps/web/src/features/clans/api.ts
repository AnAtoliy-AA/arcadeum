import { apiClient, ApiClientOptions } from '@/shared/lib/api-client';
import type { Clan, ClanMember } from './model/types';

export const clansApi = {
  getMyClan: async (options?: ApiClientOptions): Promise<Clan | null> => {
    return apiClient.get<Clan | null>('/clans/me', options);
  },

  getClanById: async (
    clanId: string,
    options?: ApiClientOptions,
  ): Promise<Clan> => {
    return apiClient.get<Clan>(`/clans/${clanId}`, options);
  },

  getClanMembers: async (
    clanId: string,
    options?: ApiClientOptions,
  ): Promise<ClanMember[]> => {
    return apiClient.get<ClanMember[]>(`/clans/${clanId}/members`, options);
  },

  createClan: async (
    data: {
      name: string;
      tag: string;
      description?: string;
      visibility?: string;
    },
    options?: ApiClientOptions,
  ): Promise<Clan> => {
    return apiClient.post<Clan>('/clans', data, options);
  },

  updateClan: async (
    clanId: string,
    data: Partial<{
      name: string;
      tag: string;
      description: string;
      avatarUrl: string;
      visibility: string;
    }>,
    options?: ApiClientOptions,
  ): Promise<Clan> => {
    return apiClient.patch<Clan>(`/clans/${clanId}`, data, options);
  },

  joinClan: async (
    clanId: string,
    options?: ApiClientOptions,
  ): Promise<void> => {
    return apiClient.post<void>('/clans/join', { clanId }, options);
  },

  leaveClan: async (
    clanId: string,
    options?: ApiClientOptions,
  ): Promise<void> => {
    return apiClient.post<void>(`/clans/${clanId}/leave`, undefined, options);
  },

  removeMember: async (
    clanId: string,
    userId: string,
    options?: ApiClientOptions,
  ): Promise<void> => {
    return apiClient.post<void>(
      `/clans/${clanId}/remove/${userId}`,
      undefined,
      options,
    );
  },

  setMemberRole: async (
    clanId: string,
    userId: string,
    role: string,
    options?: ApiClientOptions,
  ): Promise<void> => {
    return apiClient.post<void>(
      `/clans/${clanId}/role/${userId}`,
      { role },
      options,
    );
  },

  searchClans: async (
    query: string,
    options?: ApiClientOptions,
  ): Promise<Clan[]> => {
    return apiClient.get<Clan[]>(
      `/clans/search?q=${encodeURIComponent(query)}`,
      options,
    );
  },

  getPopularClans: async (options?: ApiClientOptions): Promise<Clan[]> => {
    return apiClient.get<Clan[]>('/clans/popular', options);
  },

  getClanByInviteCode: async (
    code: string,
    options?: ApiClientOptions,
  ): Promise<Clan | null> => {
    return apiClient.get<Clan | null>(`/clans/invite/${code}`, options);
  },

  regenerateInviteCode: async (
    clanId: string,
    options?: ApiClientOptions,
  ): Promise<{ inviteCode: string }> => {
    return apiClient.post<{ inviteCode: string }>(
      `/clans/${clanId}/regenerate-code`,
      undefined,
      options,
    );
  },
};
