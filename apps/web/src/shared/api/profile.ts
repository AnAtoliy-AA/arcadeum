import { apiClient } from '@/shared/lib/api-client';
import type { Friend } from '@/shared/api/friends';
import type { Achievement } from '@/features/achievements/server/achievements.types';

export interface PublicUserProfile {
  id: string;
  username: string;
  displayName: string | null;
  role: string;
  xp: number;
  level: number;
  prestige: number;
  equippedAvatarId: string | null;
  equippedBadgeId: string | null;
  equippedNameColorId: string | null;
  equippedFrameId: string | null;
  equippedAuraId: string | null;
  equippedBannerId: string | null;
  countryCode: string | null;
  createdAt: string | null;
}

export async function getUserProfile(
  userId: string,
  options?: { token?: string },
): Promise<PublicUserProfile> {
  return apiClient.get<PublicUserProfile>(`/auth/users/${userId}`, options);
}

export async function getUserFriends(
  userId: string,
  options?: { token?: string },
): Promise<Friend[]> {
  return apiClient.get<Friend[]>(`/friends/user/${userId}`, options);
}

export async function getUserAchievements(
  userId: string,
): Promise<Achievement[]> {
  return apiClient.get<Achievement[]>(`/achievements/user/${userId}`);
}

export async function getUserStats(
  userId: string,
  options?: { token?: string },
): Promise<import('@/features/history/api').PlayerStats> {
  return apiClient.get<import('@/features/history/api').PlayerStats>(
    `/games/stats/user/${userId}`,
    options,
  );
}

export async function getUserTrends(
  userId: string,
  options?: { token?: string; gameId?: string; limit?: number },
): Promise<import('@/features/history/api').TrendsResponse> {
  const params = new URLSearchParams();
  if (options?.gameId) params.append('gameId', options.gameId);
  if (options?.limit) params.append('limit', String(options.limit));
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiClient.get<import('@/features/history/api').TrendsResponse>(
    `/games/stats/user/${userId}/trends${qs}`,
    options?.token ? { token: options.token } : undefined,
  );
}

export async function getUserHistory(
  userId: string,
  options?: { token?: string; page?: number; limit?: number },
): Promise<import('@/features/history/api').GetHistoryResponse> {
  const params = new URLSearchParams();
  if (options?.page !== undefined) params.append('page', String(options.page));
  if (options?.limit !== undefined)
    params.append('limit', String(options.limit));
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiClient.get<import('@/features/history/api').GetHistoryResponse>(
    `/games/history/user/${userId}${qs}`,
    options?.token ? { token: options.token } : undefined,
  );
}

export async function getHeadToHeadWithUser(
  userId2: string,
  options?: { token?: string; gameId?: string },
): Promise<import('@/features/history/api').HeadToHeadResponse> {
  const params = new URLSearchParams();
  params.append('userId2', userId2);
  if (options?.gameId) params.append('gameId', options.gameId);
  return apiClient.get<import('@/features/history/api').HeadToHeadResponse>(
    `/games/stats/head-to-head?${params.toString()}`,
    options?.token ? { token: options.token } : undefined,
  );
}
