import { create } from 'zustand';

interface LevelUpModalState {
  isOpen: boolean;
  level: number;
  coinAmount: number;
  badgeId: string | null;
  isClaiming: boolean;
  isClaimed: boolean;
  openModal: (
    level: number,
    coinAmount: number,
    badgeId?: string | null,
  ) => void;
  closeModal: () => void;
  setClaiming: (isClaiming: boolean) => void;
  setClaimed: (isClaimed: boolean) => void;
}

export const useLevelUpModalStore = create<LevelUpModalState>((set) => ({
  isOpen: false,
  level: 1,
  coinAmount: 50,
  badgeId: null,
  isClaiming: false,
  isClaimed: false,
  openModal: (level, coinAmount, badgeId = null) =>
    set({
      isOpen: true,
      level,
      coinAmount,
      badgeId,
      isClaiming: false,
      isClaimed: false,
    }),
  closeModal: () => set({ isOpen: false }),
  setClaiming: (isClaiming) => set({ isClaiming }),
  setClaimed: (isClaimed) => set({ isClaimed }),
}));
