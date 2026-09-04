import { apiClient } from '@/shared/lib/api-client';
import type { Friend } from '@/shared/api/friends';

export interface PublicUserProfile {
  id: string;
  username: string;
  displayName: string | null;
  role: string;
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
