import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface TutorialState {
  completedAt: Record<string, number>;
  dismissedAt: Record<string, number>;
  activeExpectedAction: string | null;
  interactiveCallback: (() => void) | null;
  markCompleted: (gameId: string) => void;
  markDismissed: (gameId: string) => void;
  hasSeenTutorial: (gameId: string) => boolean;
  isCompleted: (gameId: string) => boolean;
  resetTutorials: () => void;
  setExpectedAction: (action: string | null, onMatch?: () => void) => void;
  recordGameAction: (action: string) => boolean;
}

export const TUTORIALS_STORAGE_KEY = 'arcadeum_tutorials_v1';

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set, get) => ({
      completedAt: {},
      dismissedAt: {},
      activeExpectedAction: null,
      interactiveCallback: null,

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

      resetTutorials: () =>
        set({
          completedAt: {},
          dismissedAt: {},
          activeExpectedAction: null,
          interactiveCallback: null,
        }),

      setExpectedAction: (action, onMatch) =>
        set({
          activeExpectedAction: action,
          interactiveCallback: onMatch ?? null,
        }),

      recordGameAction: (action) => {
        const { activeExpectedAction, interactiveCallback } = get();
        if (
          activeExpectedAction &&
          (activeExpectedAction === action || activeExpectedAction === 'any')
        ) {
          if (interactiveCallback) {
            interactiveCallback();
          }
          set({ activeExpectedAction: null, interactiveCallback: null });
          return true;
        }
        return false;
      },
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
