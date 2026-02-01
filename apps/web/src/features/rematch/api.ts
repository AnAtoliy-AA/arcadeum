import { apiClient, ApiClientOptions } from '@/shared/lib/api-client';
import type { GameOptions } from '@/shared/types/games';

interface CreateRematchParams {
  participantIds: string[];
  gameOptions?: GameOptions;
  message?: string;
}

interface CreateRematchResponse {
  room:
    | {
        id: string;
      }
    | string;
}

export const rematchApi = {
  /**
   * Create a rematch from a previous game
   */
  createRematch: async (
    roomId: string,
    params: CreateRematchParams,
    options?: ApiClientOptions,
  ): Promise<CreateRematchResponse> => {
    return apiClient.post<CreateRematchResponse>(
      `/games/history/${encodeURIComponent(roomId)}/rematch`,
      params,
      options,
    );
  },

  /**
   * Decline a rematch invitation
   */
  declineInvitation: async (
    roomId: string,
    options?: ApiClientOptions,
  ): Promise<void> => {
    return apiClient.post(
      `/games/rooms/${encodeURIComponent(roomId)}/invitation/decline`,
      undefined,
      options,
    );
  },

  /**
   * Reinvite users to a room
   */
  reinvite: async (
    roomId: string,
    userIds: string[],
    options?: ApiClientOptions,
  ): Promise<void> => {
    return apiClient.post(
      `/games/rooms/${encodeURIComponent(roomId)}/invitation/invite`,
      { userIds },
      options,
    );
  },

  /**
   * Block future rematch invitations from this room
   */
  blockRematch: async (
    roomId: string,
    options?: ApiClientOptions,
  ): Promise<void> => {
    return apiClient.post(
      `/games/rooms/${encodeURIComponent(roomId)}/invitation/block`,
      undefined,
      options,
    );
  },

  /**
   * Block a user from sending invitations
   */
  blockUser: async (
    userId: string,
    options?: ApiClientOptions,
  ): Promise<void> => {
    return apiClient.post(
      `/auth/block/${encodeURIComponent(userId)}`,
      undefined,
      options,
    );
  },
};
