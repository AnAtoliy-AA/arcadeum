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

  getLeaderboard: async (
    params?: {
      sortBy?: string;
      limit?: number;
      offset?: number;
    },
    options?: ApiClientOptions,
  ) => {
    const query = new URLSearchParams();
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.limit !== undefined) query.set('limit', String(params.limit));
    if (params?.offset !== undefined)
      query.set('offset', String(params.offset));
    const qs = query.toString();
    return apiClient.get<import('./model/types').ClanLeaderboardResponse>(
      `/clans/leaderboard${qs ? `?${qs}` : ''}`,
      options,
    );
  },

  getClanMvps: async (
    clanId: string,
    limit = 10,
    options?: ApiClientOptions,
  ) => {
    return apiClient.get<import('./model/types').ClanMvpEntry[]>(
      `/clans/${clanId}/mvps?limit=${limit}`,
      options,
    );
  },

  getCommunityChallenges: async (options?: ApiClientOptions) => {
    return apiClient.get<import('./model/types').CommunityChallenge[]>(
      '/clans/challenges',
      options,
    );
  },

  contributeToChallenge: async (
    challengeId: string,
    amount = 1,
    options?: ApiClientOptions,
  ) => {
    return apiClient.post<import('./model/types').CommunityChallenge>(
      `/clans/challenges/${challengeId}/contribute`,
      { amount },
      options,
    );
  },

  getActiveClanWars: async (
    clanId?: string,
    options?: ApiClientOptions,
  ): Promise<import('./model/types').ClanWar[]> => {
    const qs = clanId ? `?clanId=${encodeURIComponent(clanId)}` : '';
    return apiClient.get<import('./model/types').ClanWar[]>(
      `/clans/wars/active${qs}`,
      options,
    );
  },

  getClanWarById: async (
    warId: string,
    options?: ApiClientOptions,
  ): Promise<import('./model/types').ClanWar> => {
    return apiClient.get<import('./model/types').ClanWar>(
      `/clans/wars/${warId}`,
      options,
    );
  },

  declareClanWar: async (
    clanId: string,
    targetClanId: string,
    params?: { gameId?: string; targetScore?: number },
    options?: ApiClientOptions,
  ): Promise<import('./model/types').ClanWar> => {
    return apiClient.post<import('./model/types').ClanWar>(
      `/clans/wars/challenge?clanId=${encodeURIComponent(clanId)}`,
      {
        targetClanId,
        gameId: params?.gameId,
        targetScore: params?.targetScore,
      },
      options,
    );
  },

  respondClanWar: async (
    clanId: string,
    warId: string,
    accept: boolean,
    options?: ApiClientOptions,
  ): Promise<import('./model/types').ClanWar> => {
    return apiClient.post<import('./model/types').ClanWar>(
      `/clans/wars/${warId}/respond?clanId=${encodeURIComponent(clanId)}`,
      { accept },
      options,
    );
  },

  recordClanWarMatch: async (
    warId: string,
    matchData: {
      winningClanId: string;
      winnerName: string;
      loserClanId: string;
      loserName: string;
      gameId?: string;
    },
    options?: ApiClientOptions,
  ): Promise<import('./model/types').ClanWar> => {
    return apiClient.post<import('./model/types').ClanWar>(
      `/clans/wars/${warId}/record-match`,
      matchData,
      options,
    );
  },

  getClanWarHistory: async (
    clanId: string,
    options?: ApiClientOptions,
  ): Promise<import('./model/types').ClanWar[]> => {
    return apiClient.get<import('./model/types').ClanWar[]>(
      `/clans/${clanId}/wars`,
      options,
    );
  },
};
