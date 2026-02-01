import { apiClient, ApiClientOptions } from '@/shared/lib/api-client';

export interface BlockedUser {
  id: string;
  displayName: string;
  username: string;
}

export const authApi = {
  getBlockedUsers: async (
    options?: ApiClientOptions,
  ): Promise<BlockedUser[]> => {
    return apiClient.get<BlockedUser[]>('/auth/blocked', options);
  },

  unblockUser: async (
    userId: string,
    options?: ApiClientOptions,
  ): Promise<void> => {
    return apiClient.delete(
      `/auth/block/${encodeURIComponent(userId)}`,
      options,
    );
  },
};
