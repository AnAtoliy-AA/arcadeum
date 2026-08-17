import { create } from 'zustand';
import { rankingApi } from '../api';
import type { MyRanking, RatingDelta } from '../model/types';

interface RankingState {
  /** Current user's ranked rating per game, keyed by `gameId`. */
  ratings: Record<string, MyRanking>;
  loaded: boolean;
  loadMyRankings: (userId: string, token?: string) => Promise<void>;
  applyDelta: (gameId: string, delta: RatingDelta) => void;
  reset: () => void;
}

export const useRankingStore = create<RankingState>((set, get) => ({
  ratings: {},
  loaded: false,

  loadMyRankings: async (userId: string, token?: string) => {
    if (!userId || userId.startsWith('anon_')) return;
    const rows = await rankingApi.getMyRankings({ token });
    const ratings: Record<string, MyRanking> = {};
    for (const row of rows) {
      ratings[row.gameId] = row;
    }
    set({ ratings, loaded: true });
  },

  applyDelta: (gameId: string, delta: RatingDelta) => {
    const current = get().ratings[gameId];
    const next: MyRanking = current
      ? {
          ...current,
          elo: delta.elo,
          tier: delta.tier,
          peakElo: Math.max(current.peakElo, delta.elo),
          rankedGames: current.rankedGames + 1,
        }
      : {
          gameId,
          season: '',
          elo: delta.elo,
          tier: delta.tier,
          peakElo: delta.elo,
          wins: delta.delta > 0 ? 1 : 0,
          losses: delta.delta < 0 ? 1 : 0,
          draws: delta.delta === 0 ? 1 : 0,
          rankedGames: 1,
          rank: null,
        };
    set({ ratings: { ...get().ratings, [gameId]: next } });
  },

  reset: () => set({ ratings: {}, loaded: false }),
}));
