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

// Pin the rotation day so tests are deterministic regardless of when CI runs.
const FIXED_DAY = new Date('2026-01-01T00:00:00Z');

describe('pickFeaturedDrop', () => {
  it('returns null when no epic or legendary candidates exist', () => {
    expect(
      pickFeaturedDrop([item('a', 'common', 100), item('b', 'rare', 200)]),
    ).toBeNull();
  });

  it('prefers an unowned legendary over an unowned epic', () => {
    const out = pickFeaturedDrop(
      [item('leg', 'legendary', 100), item('epic', 'epic', 10_000)],
      100,
      { today: FIXED_DAY },
    );
    expect(out?.itemId).toBe('leg');
  });

  it('skips items the user already owns and picks an unowned one in the same tier', () => {
    const out = pickFeaturedDrop(
      [item('leg-a', 'legendary', 100), item('leg-b', 'legendary', 500)],
      100,
      { today: FIXED_DAY, ownedItemIds: new Set(['leg-a']) },
    );
    expect(out?.itemId).toBe('leg-b');
  });

  it('falls back to unowned epic when every legendary is owned', () => {
    const out = pickFeaturedDrop(
      [
        item('leg', 'legendary', 999),
        item('epic-a', 'epic', 100),
        item('epic-b', 'epic', 200),
      ],
      100,
      { today: FIXED_DAY, ownedItemIds: new Set(['leg']) },
    );
    expect(out?.itemId).toMatch(/^epic-/);
  });

  it('returns null when every legendary AND epic is already owned', () => {
    expect(
      pickFeaturedDrop(
        [item('leg', 'legendary', 999), item('epic', 'epic', 100)],
        100,
        { today: FIXED_DAY, ownedItemIds: new Set(['leg', 'epic']) },
      ),
    ).toBeNull();
  });

  it('rotates the pick across days within the same tier', () => {
    const catalog = [
      item('leg-a', 'legendary', 100),
      item('leg-b', 'legendary', 100),
      item('leg-c', 'legendary', 100),
    ];
    const picks = new Set<string | undefined>();
    for (let day = 1; day <= 7; day++) {
      const out = pickFeaturedDrop(catalog, 100, {
        today: new Date(`2026-01-0${day}T00:00:00Z`),
      });
      picks.add(out?.itemId);
    }
    // 7 days, 3 candidates → rotation hits each at least once.
    expect(picks.size).toBe(3);
  });

  it('is stable within a single day', () => {
    const catalog = [
      item('leg-a', 'legendary', 100),
      item('leg-b', 'legendary', 100),
    ];
    const a = pickFeaturedDrop(catalog, 100, { today: FIXED_DAY });
    const b = pickFeaturedDrop(catalog, 100, { today: FIXED_DAY });
    expect(a?.itemId).toBe(b?.itemId);
  });

  it('skips unavailable items', () => {
    const out = pickFeaturedDrop(
      [
        item('off', 'legendary', 999, 'coins', false),
        item('on', 'epic', 100, 'coins', true),
      ],
      100,
      { today: FIXED_DAY },
    );
    expect(out?.itemId).toBe('on');
  });

  it('returns endsAtIso: null (placeholder until BE supports drop scheduling)', () => {
    const out = pickFeaturedDrop([item('a', 'legendary', 100)], 100, {
      today: FIXED_DAY,
    });
    expect(out?.endsAtIso).toBeNull();
  });
});
