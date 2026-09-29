import { describe, it, expect } from 'vitest';
import { ownedByCategory, refundForRow } from './inventoryViewHelpers';
import type {
  EffectiveShopItem,
  InventoryItemView,
} from '../server/shop.types';

function createItem(
  id: string,
  category: EffectiveShopItem['category'],
): EffectiveShopItem {
  return {
    id,
    category,
    rarity: 'common',
    nameKey: `items.${id}.name`,
    descKey: `items.${id}.desc`,
    assetUrl: `/${id}.png`,
    defaultPriceAmount: 100,
    defaultPriceCurrency: 'coins',
    available: true,
    priceAmount: 100,
    priceCurrency: 'coins',
    overridden: false,
  };
}

describe('inventoryViewHelpers', () => {
  it('calculates refundForRow correctly', () => {
    const coinItem: InventoryItemView = {
      rowId: '1',
      itemId: 'avatar-1',
      purchaseId: 'p-1',
      acquiredVia: 'purchase',
      paidAmount: 200,
      paidCurrency: 'coins',
      soldAt: null,
      createdAt: '2026-01-01',
    };
    expect(refundForRow(coinItem, 100)).toBe(100);

    const gemItem: InventoryItemView = {
      rowId: '2',
      itemId: 'avatar-2',
      purchaseId: 'p-2',
      acquiredVia: 'purchase',
      paidAmount: 2,
      paidCurrency: 'gems',
      soldAt: null,
      createdAt: '2026-01-01',
    };
    expect(refundForRow(gemItem, 100)).toBe(100);

    const freeItem: InventoryItemView = {
      rowId: '3',
      itemId: 'avatar-3',
      purchaseId: 'p-3',
      acquiredVia: 'grant',
      paidAmount: null,
      paidCurrency: null,
      soldAt: null,
      createdAt: '2026-01-01',
    };
    expect(refundForRow(freeItem, 100)).toBe(0);
  });

  it('sorts owned badges by level in ascending order regardless of catalog order', () => {
    const catalog: EffectiveShopItem[] = [
      createItem('badge-nexus', 'badge'),
      createItem('badge-newcomer', 'badge'),
      createItem('badge-scout', 'badge'),
      createItem('badge-paladin', 'badge'),
    ];

    const inventory: InventoryItemView[] = [
      {
        rowId: 'r-1',
        itemId: 'badge-nexus',
        purchaseId: null,
        acquiredVia: 'grant',
        paidAmount: null,
        paidCurrency: null,
        soldAt: null,
        createdAt: '2026-01-01',
      },
      {
        rowId: 'r-2',
        itemId: 'badge-newcomer',
        purchaseId: null,
        acquiredVia: 'grant',
        paidAmount: null,
        paidCurrency: null,
        soldAt: null,
        createdAt: '2026-01-01',
      },
      {
        rowId: 'r-3',
        itemId: 'badge-scout',
        purchaseId: null,
        acquiredVia: 'grant',
        paidAmount: null,
        paidCurrency: null,
        soldAt: null,
        createdAt: '2026-01-01',
      },
      {
        rowId: 'r-4',
        itemId: 'badge-paladin',
        purchaseId: null,
        acquiredVia: 'grant',
        paidAmount: null,
        paidCurrency: null,
        soldAt: null,
        createdAt: '2026-01-01',
      },
    ];

    const result = ownedByCategory(catalog, inventory);
    const badgeIds = result.badge.map((b) => b.id);

    expect(badgeIds).toEqual([
      'badge-newcomer',
      'badge-scout',
      'badge-paladin',
      'badge-nexus',
    ]);
  });
});
