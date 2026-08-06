import { create } from 'zustand';

interface GameRematchState {
  isGameOver: boolean;
  onRematch: (() => void) | null;
  rematchLoading: boolean;
  setRematchState: (state: {
    isGameOver: boolean;
    onRematch: (() => void) | null;
    rematchLoading: boolean;
  }) => void;
  reset: () => void;
}

export const useGameRematchStore = create<GameRematchState>((set) => ({
  isGameOver: false,
  onRematch: null,
  rematchLoading: false,
  setRematchState: (state) => set(state),
  reset: () =>
    set({ isGameOver: false, onRematch: null, rematchLoading: false }),
}));
