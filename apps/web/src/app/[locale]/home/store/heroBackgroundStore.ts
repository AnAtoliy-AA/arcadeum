import { create } from 'zustand';
import { HERO_GAMES } from '../data/heroVariants';

interface HeroBackgroundState {
  activeGameId: string | null;
  accentGlow: string;
  setActiveGameId: (gameId: string | null) => void;
  reset: () => void;
}

const DEFAULT_GLOW = 'rgba(20, 184, 166, 0.18)';

export const useHeroBackgroundStore = create<HeroBackgroundState>((set) => ({
  activeGameId: null,
  accentGlow: DEFAULT_GLOW,
  setActiveGameId: (gameId) => {
    if (!gameId) {
      set({ activeGameId: null, accentGlow: DEFAULT_GLOW });
      return;
    }
    const found = HERO_GAMES.find((g) => g.id === gameId);
    set({
      activeGameId: gameId,
      accentGlow: found ? found.glowColor : DEFAULT_GLOW,
    });
  },
  reset: () => set({ activeGameId: null, accentGlow: DEFAULT_GLOW }),
}));

export const DEFAULT_HERO_BG = '/images/home/hero-bg.webp';
