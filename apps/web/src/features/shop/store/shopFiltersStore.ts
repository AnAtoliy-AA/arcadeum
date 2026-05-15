'use client';

import { create } from 'zustand';
import type { ShopCategory, ShopRarity } from '../server/shop.types';

export type ShopViewTab = 'browse' | 'inventory';

interface ShopFiltersState {
  tab: ShopViewTab;
  category: ShopCategory | 'all';
  rarities: Set<ShopRarity>;
  setTab: (tab: ShopViewTab) => void;
  setCategory: (category: ShopCategory | 'all') => void;
  toggleRarity: (rarity: ShopRarity) => void;
  reset: () => void;
}

const ALL_RARITIES: ShopRarity[] = ['common', 'rare', 'epic', 'legendary'];

export const useShopFiltersStore = create<ShopFiltersState>((set) => ({
  tab: 'browse',
  category: 'all',
  rarities: new Set(ALL_RARITIES),
  setTab: (tab) => set({ tab }),
  setCategory: (category) => set({ category }),
  toggleRarity: (rarity) =>
    set((state) => {
      const next = new Set(state.rarities);
      if (next.has(rarity)) next.delete(rarity);
      else next.add(rarity);
      return { rarities: next };
    }),
  reset: () =>
    set({
      tab: 'browse',
      category: 'all',
      rarities: new Set(ALL_RARITIES),
    }),
}));
