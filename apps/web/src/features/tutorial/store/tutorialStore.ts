import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Tracks per-game tutorial progress in localStorage so a returning
 * player is never re-prompted. Completion and dismissal are stored
 * separately: dismissal means "seen but skipped" (still counts as seen
 * for auto-open purposes, but the tutorial can be replayed manually).
 */
interface TutorialState {
  completedAt: Record<string, number>;
  dismissedAt: Record<string, number>;
  markCompleted: (gameId: string) => void;
  markDismissed: (gameId: string) => void;
  hasSeenTutorial: (gameId: string) => boolean;
  isCompleted: (gameId: string) => boolean;
  resetTutorials: () => void;
}

export const TUTORIALS_STORAGE_KEY = 'arcadeum_tutorials_v1';

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set, get) => ({
      completedAt: {},
      dismissedAt: {},

      markCompleted: (gameId) =>
        set((state) => ({
          completedAt: { ...state.completedAt, [gameId]: Date.now() },
        })),

      markDismissed: (gameId) =>
        set((state) => ({
          dismissedAt: { ...state.dismissedAt, [gameId]: Date.now() },
        })),

      hasSeenTutorial: (gameId) =>
        get().completedAt[gameId] !== undefined ||
        get().dismissedAt[gameId] !== undefined,

      isCompleted: (gameId) => get().completedAt[gameId] !== undefined,

      resetTutorials: () => set({ completedAt: {}, dismissedAt: {} }),
    }),
    {
      name: TUTORIALS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        completedAt: state.completedAt,
        dismissedAt: state.dismissedAt,
      }),
    },
  ),
);
