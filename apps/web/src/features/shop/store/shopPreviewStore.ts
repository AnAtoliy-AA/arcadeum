'use client';

import { create } from 'zustand';
import type { EffectiveShopItem, ShopCategory } from '../server/shop.types';

interface ShopPreviewState {
  hoverItem: EffectiveShopItem | null;
  activeSlot: ShopCategory | null;
  setHover: (item: EffectiveShopItem | null) => void;
  setActiveSlot: (slot: ShopCategory | null) => void;
  clearActiveSlot: () => void;
  reset: () => void;
}

export const useShopPreviewStore = create<ShopPreviewState>((set) => ({
  hoverItem: null,
  activeSlot: null,
  setHover: (item) => set({ hoverItem: item }),
  setActiveSlot: (slot) => set({ activeSlot: slot }),
  clearActiveSlot: () => set({ activeSlot: null }),
  reset: () => set({ hoverItem: null, activeSlot: null }),
}));
