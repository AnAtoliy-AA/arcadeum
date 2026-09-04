import { apiClient, type ApiClientOptions } from '@/shared/lib/api-client';

export interface SoloScoreRecord {
  gameId: string;
  difficulty: string;
  score: number;
  moves: number;
  durationMs: number;
  result: 'won' | 'lost';
  sessionId: string;
  timestamp: number;
}

export interface SoloLeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  displayName: string | null;
  score: number;
  moves: number;
  durationMs: number;
  totalGames: number;
  equippedAvatarId: string | null;
  equippedBadgeId: string | null;
  equippedNameColorId: string | null;
  equippedFrameId: string | null;
}

export interface SoloLeaderboardResponse {
  entries: SoloLeaderboardEntry[];
  total: number;
}

export interface SoloPersonalBest {
  gameId: string;
  difficulty: string;
  bestScore: number;
  bestMoves: number;
  bestDurationMs: number;
  totalGames: number;
  wins: number;
}

export interface SoloRecentGame {
  gameId: string;
  difficulty: string;
  score: number;
  moves: number;
  durationMs: number;
  result: 'won' | 'lost';
  timestamp: number;
}

export const soloScoresApi = {
  getLeaderboard: async (
    gameId: string,
    difficulty: string,
    sortBy: 'score' | 'durationMs' = 'score',
    order: 'asc' | 'desc' = 'desc',
    limit = 20,
    offset = 0,
    options?: ApiClientOptions,
  ): Promise<SoloLeaderboardResponse> => {
    const params = new URLSearchParams({
      gameId,
      difficulty,
      sortBy,
      order,
      limit: String(limit),
      offset: String(offset),
    });
    return apiClient.get<SoloLeaderboardResponse>(
      `/games/solo-scores/leaderboard?${params.toString()}`,
      options,
    );
  },

  getPersonalBests: async (
    gameId?: string,
    options?: ApiClientOptions,
  ): Promise<SoloPersonalBest[]> => {
    const params = new URLSearchParams();
    if (gameId) params.append('gameId', gameId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<SoloPersonalBest[]>(
      `/games/solo-scores/best${qs}`,
      options,
    );
  },

  syncScores: async (
    records: SoloScoreRecord[],
    options?: ApiClientOptions,
  ): Promise<{ synced: number; duplicates: number }> => {
    return apiClient.post<{ synced: number; duplicates: number }>(
      '/games/solo-scores/sync',
      { records },
      options,
    );
  },

  getRecentGames: async (
    gameId?: string,
    difficulty?: string,
    limit = 20,
    options?: ApiClientOptions,
  ): Promise<SoloRecentGame[]> => {
    const params = new URLSearchParams();
    if (gameId) params.append('gameId', gameId);
    if (difficulty) params.append('difficulty', difficulty);
    params.append('limit', String(limit));
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<SoloRecentGame[]>(
      `/games/solo-scores/recent${qs}`,
      options,
    );
  },
};
