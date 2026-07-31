import { create } from 'zustand';

const DEFAULT_HERO_BG = '/images/home/hero-bg.webp';

interface HeroBackgroundState {
  bgImage: string;
  setBgImage: (src: string) => void;
  resetBgImage: () => void;
}

export const useHeroBackgroundStore = create<HeroBackgroundState>((set) => ({
  bgImage: DEFAULT_HERO_BG,
  setBgImage: (src) => set({ bgImage: src }),
  resetBgImage: () => set({ bgImage: DEFAULT_HERO_BG }),
}));

export { DEFAULT_HERO_BG };
