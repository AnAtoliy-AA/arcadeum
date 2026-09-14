import { apiClient, type ApiClientOptions } from '@/shared/lib/api-client';

export interface SoloRatingMe {
  rating: number;
  tier: string;
  peakRating: number;
  wins: number;
  losses: number;
  winsWithUndo: number;
  lossesWithUndo: number;
  totalGames: number;
}

export interface SoloRatingLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string | null;
  rating: number;
  tier: string;
  peakRating: number;
  wins: number;
  losses: number;
  totalGames: number;
  equippedAvatarId: string | null;
  equippedBadgeId: string | null;
  equippedNameColorId: string | null;
  equippedFrameId: string | null;
}

export interface SoloRatingLeaderboardResponse {
  entries: SoloRatingLeaderboardEntry[];
  total: number;
}

export const soloRatingApi = {
  getMyRating: async (
    options?: ApiClientOptions,
  ): Promise<SoloRatingMe | null> => {
    return apiClient.get<SoloRatingMe | null>('/games/solo-rating/me', options);
  },

  getLeaderboard: async (
    limit = 20,
    offset = 0,
    options?: ApiClientOptions,
  ): Promise<SoloRatingLeaderboardResponse> => {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    return apiClient.get<SoloRatingLeaderboardResponse>(
      `/games/solo-rating/leaderboard?${params.toString()}`,
      options,
    );
  },
};
