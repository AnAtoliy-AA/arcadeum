import { describe, it, expect } from 'vitest';
import { pickFeaturedDrop } from './featuredDrop';
import type {
  EffectiveShopItem,
  ShopPriceCurrency,
  ShopRarity,
} from '../server/shop.types';

function item(
  id: string,
  rarity: ShopRarity,
  priceAmount: number,
  priceCurrency: ShopPriceCurrency = 'coins',
  available = true,
): EffectiveShopItem {
  return {
    id,
    category: 'avatar',
    rarity,
    nameKey: `items.avatar.${id}.name`,
    descKey: `items.avatar.${id}.desc`,
    assetUrl: '',
    defaultPriceAmount: priceAmount,
    defaultPriceCurrency: priceCurrency,
    available,
    priceAmount,
    priceCurrency,
    overridden: false,
  };
}

describe('pickFeaturedDrop', () => {
  it('returns null when no epic or legendary candidates exist', () => {
    expect(
      pickFeaturedDrop([item('a', 'common', 100), item('b', 'rare', 200)]),
    ).toBeNull();
  });

  it('prefers legendary over epic, regardless of price', () => {
    const out = pickFeaturedDrop([
      item('cheap-leg', 'legendary', 100),
      item('rich-epic', 'epic', 10_000),
    ]);
    expect(out?.itemId).toBe('cheap-leg');
  });

  it('within rarity, prefers higher coin-equivalent price', () => {
    const out = pickFeaturedDrop([
      item('cheap', 'legendary', 100),
      item('pricey', 'legendary', 500),
    ]);
    expect(out?.itemId).toBe('pricey');
  });

  it('factors gemToCoinRate into the coin-equivalent comparison', () => {
    // 5 gems @ rate 100 = 500 coins; 400 coins direct → gems wins
    const out = pickFeaturedDrop(
      [
        item('coin-item', 'legendary', 400, 'coins'),
        item('gem-item', 'legendary', 5, 'gems'),
      ],
      100,
    );
    expect(out?.itemId).toBe('gem-item');
  });

  it('skips unavailable items', () => {
    const out = pickFeaturedDrop([
      item('off', 'legendary', 999, 'coins', false),
      item('on', 'epic', 100, 'coins', true),
    ]);
    expect(out?.itemId).toBe('on');
  });

  it('returns endsAtIso: null (placeholder until BE supports drop scheduling)', () => {
    const out = pickFeaturedDrop([item('a', 'legendary', 100)]);
    expect(out?.endsAtIso).toBeNull();
  });
});
