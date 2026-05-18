import { describe, it, expect, beforeEach } from 'vitest';
import { useShopPreviewStore } from './shopPreviewStore';
import type { EffectiveShopItem, ShopRarity } from '../server/shop.types';

function item(
  id: string,
  category: EffectiveShopItem['category'] = 'avatar',
  rarity: ShopRarity = 'common',
): EffectiveShopItem {
  return {
    id,
    category,
    rarity,
    nameKey: '',
    descKey: '',
    assetUrl: '',
    defaultPriceAmount: 0,
    defaultPriceCurrency: 'coins',
    available: true,
    priceAmount: 0,
    priceCurrency: 'coins',
    overridden: false,
  };
}

describe('useShopPreviewStore', () => {
  beforeEach(() => {
    useShopPreviewStore.getState().reset();
  });

  it('starts with no hover and no active slot', () => {
    const s = useShopPreviewStore.getState();
    expect(s.hoverItem).toBeNull();
    expect(s.activeSlot).toBeNull();
  });

  it('setHover updates the hovered item', () => {
    const a = item('a');
    useShopPreviewStore.getState().setHover(a);
    expect(useShopPreviewStore.getState().hoverItem?.id).toBe('a');
    useShopPreviewStore.getState().setHover(null);
    expect(useShopPreviewStore.getState().hoverItem).toBeNull();
  });

  it('setActiveSlot / clearActiveSlot toggle the active slot', () => {
    useShopPreviewStore.getState().setActiveSlot('badge');
    expect(useShopPreviewStore.getState().activeSlot).toBe('badge');
    useShopPreviewStore.getState().clearActiveSlot();
    expect(useShopPreviewStore.getState().activeSlot).toBeNull();
  });
});
