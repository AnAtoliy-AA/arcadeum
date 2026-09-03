import { apiClient } from '@/shared/lib/api-client';

export interface Friend {
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  equippedAvatarId: string | null;
  online: boolean;
}

export interface FriendRequest {
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  equippedAvatarId: string | null;
  createdAt: string;
}

export interface PendingRequests {
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
}

export interface UserSearchResult {
  id: string;
  username: string;
  displayName: string;
  email: string;
}

export async function getFriends(token: string): Promise<Friend[]> {
  return apiClient.get<Friend[]>('/friends', { token });
}

export async function getPendingRequests(
  token: string,
): Promise<PendingRequests> {
  return apiClient.get<PendingRequests>('/friends/pending', { token });
}

export async function getOnlineFriendIds(token: string): Promise<string[]> {
  return apiClient.get<string[]>('/friends/online', { token });
}

export async function sendFriendRequest(
  token: string,
  username: string,
): Promise<{ id: string }> {
  return apiClient.post<{ id: string }>(
    '/friends/request',
    { username },
    { token },
  );
}

export async function sendFriendRequestByUserId(
  token: string,
  userId: string,
): Promise<{ id: string }> {
  return apiClient.post<{ id: string }>(
    '/friends/request-by-user-id',
    { userId },
    { token },
  );
}

export async function acceptFriendRequest(
  token: string,
  friendshipId: string,
): Promise<void> {
  return apiClient.post<void>(`/friends/accept/${friendshipId}`, undefined, {
    token,
  });
}

export async function declineFriendRequest(
  token: string,
  friendshipId: string,
): Promise<void> {
  return apiClient.post<void>(`/friends/decline/${friendshipId}`, undefined, {
    token,
  });
}

export async function cancelFriendRequest(
  token: string,
  friendshipId: string,
): Promise<void> {
  return apiClient.post<void>(`/friends/cancel/${friendshipId}`, undefined, {
    token,
  });
}

export async function removeFriend(
  token: string,
  friendId: string,
): Promise<void> {
  return apiClient.delete<void>(`/friends/${friendId}`, { token });
}

export async function searchUsers(
  token: string,
  query: string,
): Promise<UserSearchResult[]> {
  return apiClient.get<UserSearchResult[]>(
    `/auth/users/search?q=${encodeURIComponent(query)}`,
    { token },
  );
}
