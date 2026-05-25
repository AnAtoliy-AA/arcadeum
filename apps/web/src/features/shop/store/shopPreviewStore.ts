'use client';

import { create } from 'zustand';
import type { EffectiveShopItem, ShopCategory } from '../server/shop.types';

interface ShopPreviewState {
  hoverItem: EffectiveShopItem | null;
  activeSlot: ShopCategory | null;
  setHover: (item: EffectiveShopItem | null) => void;
  /**
   * Card `onPointerLeave` schedules the clear instead of clearing
   * immediately. If the cursor moves into the action panel before the
   * timer fires, the panel calls `cancelClear` and the preview stays
   * alive so the user can press Buy / Equip / Unequip without the panel
   * collapsing under them.
   */
  scheduleClear: () => void;
  cancelClear: () => void;
  setActiveSlot: (slot: ShopCategory | null) => void;
  clearActiveSlot: () => void;
  reset: () => void;
}

// Window between the card leave and the panel enter. ~120 ms is the upper
// edge of "unintentional" pointer motion — long enough to bridge the gap
// between card and panel, short enough that moving cursor away from the
// shop entirely doesn't leave a stale preview.
const CLEAR_DELAY_MS = 120;

let clearTimer: ReturnType<typeof setTimeout> | null = null;

export const useShopPreviewStore = create<ShopPreviewState>((set) => ({
  hoverItem: null,
  activeSlot: null,
  setHover: (item) => {
    if (clearTimer) {
      clearTimeout(clearTimer);
      clearTimer = null;
    }
    set({ hoverItem: item });
  },
  scheduleClear: () => {
    if (clearTimer) clearTimeout(clearTimer);
    clearTimer = setTimeout(() => {
      clearTimer = null;
      set({ hoverItem: null });
    }, CLEAR_DELAY_MS);
  },
  cancelClear: () => {
    if (clearTimer) {
      clearTimeout(clearTimer);
      clearTimer = null;
    }
  },
  setActiveSlot: (slot) => set({ activeSlot: slot }),
  clearActiveSlot: () => set({ activeSlot: null }),
  reset: () => {
    if (clearTimer) {
      clearTimeout(clearTimer);
      clearTimer = null;
    }
    set({ hoverItem: null, activeSlot: null });
  },
}));
