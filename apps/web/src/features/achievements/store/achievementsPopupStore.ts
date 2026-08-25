'use client';

import { create } from 'zustand';

/** Minimal achievement payload rendered by the unlock popup. */
export interface PopupAchievement {
  achievementId: string;
  name: string;
  rarity: string;
  xpReward: number;
}

interface AchievementsPopupState {
  queue: PopupAchievement[];
  enqueueMany: (items: PopupAchievement[]) => void;
  dismiss: (achievementId: string) => void;
}

export const useAchievementsPopupStore = create<AchievementsPopupState>(
  (set) => ({
    queue: [],
    enqueueMany: (items) =>
      set((state) => {
        const seen = new Set(state.queue.map((q) => q.achievementId));
        const next = items.filter((i) => !seen.has(i.achievementId));
        return next.length > 0 ? { queue: [...state.queue, ...next] } : state;
      }),
    dismiss: (achievementId) =>
      set((state) => ({
        queue: state.queue.filter((q) => q.achievementId !== achievementId),
      })),
  }),
);
