'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  SoloRatingMe,
  SoloRatingLeaderboardEntry,
} from '@/shared/api/soloRating';

interface SoloRatingState {
  rating: SoloRatingMe | null;
  leaderboard: SoloRatingLeaderboardEntry[];
  leaderboardTotal: number;
  loading: boolean;
  setRating: (rating: SoloRatingMe | null) => void;
  setLeaderboard: (
    entries: SoloRatingLeaderboardEntry[],
    total: number,
  ) => void;
  setLoading: (loading: boolean) => void;
}

export const useSoloRatingStore = create<SoloRatingState>()(
  persist(
    (set) => ({
      rating: null,
      leaderboard: [],
      leaderboardTotal: 0,
      loading: false,

      setRating: (rating) => set({ rating }),
      setLeaderboard: (entries, total) =>
        set({ leaderboard: entries, leaderboardTotal: total }),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'arcadeum_solo_rating_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        rating: state.rating,
      }),
    },
  ),
);
