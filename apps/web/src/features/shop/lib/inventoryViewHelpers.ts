// Shared derivations for the inventory surfaces — InventoryPageView is the
// primary consumer, but ShopActionPanel uses the same refund formula and
// future surfaces (mobile inventory, admin-shop user inspector) can reuse
// the category → label-key map without redeclaring it.

import type {
  EffectiveShopItem,
  InventoryItemView,
  ShopCategory,
} from '../server/shop.types';

export type ShopRowLabelKey =
  | 'avatars'
  | 'badges'
  | 'colors'
  | 'skins'
  | 'banners'
  | 'auras'
  | 'frames';

/**
 * Maps ShopCategory → the matching `labels.row.*` slice key. Catalog rows
 * on /shop hardcode their labels per row (avatar → row.avatars, etc.); the
 * inventory page iterates over categories dynamically and needs this
 * lookup. Keys must stay in sync with ShopPageLabels.row.
 */
export const CATEGORY_TO_ROW_LABEL_KEY: Record<ShopCategory, ShopRowLabelKey> =
  {
    avatar: 'avatars',
    badge: 'badges',
    name_color: 'colors',
    game_skin: 'skins',
    banner: 'banners',
    aura: 'auras',
    frame: 'frames',
  };

/**
 * Sell-back refund formula. Coins items get 50% in coins; gem items
 * convert through the economy gem→coin rate and then halve. Free items
 * return 0 (BE rejects those server-side too).
 */
export function refundForRow(
  row: InventoryItemView,
  gemToCoinRate: number,
): number {
  if (row.paidAmount === null || row.paidCurrency === null) return 0;
  if (row.paidCurrency === 'coins') return Math.floor(row.paidAmount * 0.5);
  return Math.floor(row.paidAmount * gemToCoinRate * 0.5);
}

/**
 * Group the catalog by category, filtered to only items the user owns
 * (live, unsold inventory rows). Returns a complete record so callers
 * can iterate over every category without optional-chaining.
 */
export function ownedByCategory(
  catalog: EffectiveShopItem[],
  inventoryItems: InventoryItemView[],
): Record<ShopCategory, EffectiveShopItem[]> {
  const ownedIds = new Set(
    inventoryItems.filter((row) => row.soldAt === null).map((row) => row.itemId),
  );
  const filterOwned = (cat: ShopCategory) =>
    catalog.filter((c) => c.category === cat && ownedIds.has(c.id));
  return {
    avatar: filterOwned('avatar'),
    badge: filterOwned('badge'),
    name_color: filterOwned('name_color'),
    game_skin: filterOwned('game_skin'),
    banner: filterOwned('banner'),
    aura: filterOwned('aura'),
    frame: filterOwned('frame'),
  };
}
