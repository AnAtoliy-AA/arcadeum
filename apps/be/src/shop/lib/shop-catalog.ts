import type { ShopItemDef } from './shop-types';

/**
 * Static catalog seed. The full list of shop items lives here; admin override
 * docs (`ShopItemOverride`) can adjust `available`, `priceAmount`, and
 * `priceCurrency` per item without a deploy.
 *
 * Conventions:
 *  - `id` is stable kebab-case; it is referenced by inventory rows + equip
 *    slots, so renaming an id is a breaking change.
 *  - `nameKey` / `descKey` resolve under `pages.shop.items.<category>.<slug>`.
 *  - `assetUrl` is served as a static asset from `apps/web/public/shop/...`.
 *  - `starter: true` items are granted by `ShopInventoryBootstrap` to every
 *    user once and may not be sold back. Their price is always 0.
 */
export const SHOP_CATALOG: Record<string, ShopItemDef> = {
  'avatar-default-01': {
    id: 'avatar-default-01',
    category: 'avatar',
    rarity: 'common',
    nameKey: 'items.avatar.default01.name',
    descKey: 'items.avatar.default01.desc',
    assetUrl: '/shop/avatars/default-01.svg',
    defaultPriceAmount: 0,
    defaultPriceCurrency: 'coins',
    starter: true,
  },
  'avatar-fox-01': {
    id: 'avatar-fox-01',
    category: 'avatar',
    rarity: 'common',
    nameKey: 'items.avatar.fox01.name',
    descKey: 'items.avatar.fox01.desc',
    assetUrl: '/shop/avatars/fox-01.svg',
    defaultPriceAmount: 200,
    defaultPriceCurrency: 'coins',
  },
  'avatar-cat-01': {
    id: 'avatar-cat-01',
    category: 'avatar',
    rarity: 'common',
    nameKey: 'items.avatar.cat01.name',
    descKey: 'items.avatar.cat01.desc',
    assetUrl: '/shop/avatars/cat-01.svg',
    defaultPriceAmount: 200,
    defaultPriceCurrency: 'coins',
  },
  'avatar-dragon-01': {
    id: 'avatar-dragon-01',
    category: 'avatar',
    rarity: 'rare',
    nameKey: 'items.avatar.dragon01.name',
    descKey: 'items.avatar.dragon01.desc',
    assetUrl: '/shop/avatars/dragon-01.svg',
    defaultPriceAmount: 3,
    defaultPriceCurrency: 'gems',
  },
  'avatar-phoenix-01': {
    id: 'avatar-phoenix-01',
    category: 'avatar',
    rarity: 'epic',
    nameKey: 'items.avatar.phoenix01.name',
    descKey: 'items.avatar.phoenix01.desc',
    assetUrl: '/shop/avatars/phoenix-01.svg',
    defaultPriceAmount: 10,
    defaultPriceCurrency: 'gems',
  },
  'avatar-cosmic-01': {
    id: 'avatar-cosmic-01',
    category: 'avatar',
    rarity: 'legendary',
    nameKey: 'items.avatar.cosmic01.name',
    descKey: 'items.avatar.cosmic01.desc',
    assetUrl: '/shop/avatars/cosmic-01.svg',
    defaultPriceAmount: 30,
    defaultPriceCurrency: 'gems',
  },
  'badge-newcomer': {
    id: 'badge-newcomer',
    category: 'badge',
    rarity: 'common',
    nameKey: 'items.badge.newcomer.name',
    descKey: 'items.badge.newcomer.desc',
    assetUrl: '/shop/badges/newcomer.svg',
    defaultPriceAmount: 0,
    defaultPriceCurrency: 'coins',
    starter: true,
  },
  'badge-veteran': {
    id: 'badge-veteran',
    category: 'badge',
    rarity: 'common',
    nameKey: 'items.badge.veteran.name',
    descKey: 'items.badge.veteran.desc',
    assetUrl: '/shop/badges/veteran.svg',
    defaultPriceAmount: 500,
    defaultPriceCurrency: 'coins',
  },
  'badge-champion': {
    id: 'badge-champion',
    category: 'badge',
    rarity: 'rare',
    nameKey: 'items.badge.champion.name',
    descKey: 'items.badge.champion.desc',
    assetUrl: '/shop/badges/champion.svg',
    defaultPriceAmount: 5,
    defaultPriceCurrency: 'gems',
  },
  'badge-legend': {
    id: 'badge-legend',
    category: 'badge',
    rarity: 'legendary',
    nameKey: 'items.badge.legend.name',
    descKey: 'items.badge.legend.desc',
    assetUrl: '/shop/badges/legend.svg',
    defaultPriceAmount: 50,
    defaultPriceCurrency: 'gems',
  },
};

export const SHOP_CATALOG_IDS = Object.keys(SHOP_CATALOG);

export function getCatalogItem(id: string): ShopItemDef | null {
  return SHOP_CATALOG[id] ?? null;
}

export function listStarterItems(): ShopItemDef[] {
  return Object.values(SHOP_CATALOG).filter((item) => item.starter === true);
}
