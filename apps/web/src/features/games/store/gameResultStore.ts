import { create } from 'zustand';

interface GameResultState {
  hasResult: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setHasResult: (hasResult: boolean) => void;
  reset: () => void;
}

export const useGameResultStore = create<GameResultState>((set) => ({
  hasResult: false,
  isOpen: false,
  open: () => set({ isOpen: true, hasResult: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setIsOpen: (isOpen) => set({ isOpen }),
  setHasResult: (hasResult) => set({ hasResult }),
  reset: () => set({ hasResult: false, isOpen: false }),
}));
