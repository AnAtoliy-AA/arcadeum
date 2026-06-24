import type { ShopItemDef } from './shop-types';
import { SHOP_BACKGROUND_ITEMS } from './shop-catalog.backgrounds';
import { SHOP_COSMETIC_ITEMS } from './shop-catalog.cosmetics';

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
    assetUrl: '/shop/avatars/default-01.png',
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
    assetUrl: '/shop/avatars/fox-01.png',
    defaultPriceAmount: 200,
    defaultPriceCurrency: 'coins',
  },
  'avatar-cat-01': {
    id: 'avatar-cat-01',
    category: 'avatar',
    rarity: 'common',
    nameKey: 'items.avatar.cat01.name',
    descKey: 'items.avatar.cat01.desc',
    assetUrl: '/shop/avatars/cat-01.png',
    defaultPriceAmount: 200,
    defaultPriceCurrency: 'coins',
  },
  'avatar-dragon-01': {
    id: 'avatar-dragon-01',
    category: 'avatar',
    rarity: 'rare',
    nameKey: 'items.avatar.dragon01.name',
    descKey: 'items.avatar.dragon01.desc',
    assetUrl: '/shop/avatars/dragon-01.png',
    defaultPriceAmount: 3,
    defaultPriceCurrency: 'gems',
  },
  'avatar-phoenix-01': {
    id: 'avatar-phoenix-01',
    category: 'avatar',
    rarity: 'epic',
    nameKey: 'items.avatar.phoenix01.name',
    descKey: 'items.avatar.phoenix01.desc',
    assetUrl: '/shop/avatars/phoenix-01.png',
    defaultPriceAmount: 10,
    defaultPriceCurrency: 'gems',
  },
  'avatar-cosmic-01': {
    id: 'avatar-cosmic-01',
    category: 'avatar',
    rarity: 'legendary',
    nameKey: 'items.avatar.cosmic01.name',
    descKey: 'items.avatar.cosmic01.desc',
    assetUrl: '/shop/avatars/cosmic-01.png',
    defaultPriceAmount: 30,
    defaultPriceCurrency: 'gems',
  },
  'avatar-wolf-01': {
    id: 'avatar-wolf-01',
    category: 'avatar',
    rarity: 'epic',
    nameKey: 'items.avatar.wolf01.name',
    descKey: 'items.avatar.wolf01.desc',
    assetUrl: '/shop/avatars/wolf-01.png',
    defaultPriceAmount: 15,
    defaultPriceCurrency: 'gems',
  },
  'avatar-panther-01': {
    id: 'avatar-panther-01',
    category: 'avatar',
    rarity: 'legendary',
    nameKey: 'items.avatar.panther01.name',
    descKey: 'items.avatar.panther01.desc',
    assetUrl: '/shop/avatars/panther-01.png',
    defaultPriceAmount: 35,
    defaultPriceCurrency: 'gems',
  },
  'avatar-tiger-01': {
    id: 'avatar-tiger-01',
    category: 'avatar',
    rarity: 'epic',
    nameKey: 'items.avatar.tiger01.name',
    descKey: 'items.avatar.tiger01.desc',
    assetUrl: '/shop/avatars/tiger-01.png',
    defaultPriceAmount: 18,
    defaultPriceCurrency: 'gems',
  },
  'avatar-eagle-01': {
    id: 'avatar-eagle-01',
    category: 'avatar',
    rarity: 'legendary',
    nameKey: 'items.avatar.eagle01.name',
    descKey: 'items.avatar.eagle01.desc',
    assetUrl: '/shop/avatars/eagle-01.png',
    defaultPriceAmount: 40,
    defaultPriceCurrency: 'gems',
  },
  'avatar-lion-01': {
    id: 'avatar-lion-01',
    category: 'avatar',
    rarity: 'legendary',
    nameKey: 'items.avatar.lion01.name',
    descKey: 'items.avatar.lion01.desc',
    assetUrl: '/shop/avatars/lion-01.png',
    defaultPriceAmount: 42,
    defaultPriceCurrency: 'gems',
  },
  'avatar-shark-01': {
    id: 'avatar-shark-01',
    category: 'avatar',
    rarity: 'epic',
    nameKey: 'items.avatar.shark01.name',
    descKey: 'items.avatar.shark01.desc',
    assetUrl: '/shop/avatars/shark-01.png',
    defaultPriceAmount: 18,
    defaultPriceCurrency: 'gems',
  },
  'badge-newcomer': {
    id: 'badge-newcomer',
    category: 'badge',
    rarity: 'common',
    nameKey: 'items.badge.newcomer.name',
    descKey: 'items.badge.newcomer.desc',
    assetUrl: '/shop/badges/newcomer.png',
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
    assetUrl: '/shop/badges/veteran.png',
    defaultPriceAmount: 500,
    defaultPriceCurrency: 'coins',
  },
  'badge-champion': {
    id: 'badge-champion',
    category: 'badge',
    rarity: 'rare',
    nameKey: 'items.badge.champion.name',
    descKey: 'items.badge.champion.desc',
    assetUrl: '/shop/badges/champion.png',
    defaultPriceAmount: 5,
    defaultPriceCurrency: 'gems',
  },
  'badge-legend': {
    id: 'badge-legend',
    category: 'badge',
    rarity: 'legendary',
    nameKey: 'items.badge.legend.name',
    descKey: 'items.badge.legend.desc',
    assetUrl: '/shop/badges/legend.png',
    defaultPriceAmount: 50,
    defaultPriceCurrency: 'gems',
  },
  'badge-elite': {
    id: 'badge-elite',
    category: 'badge',
    rarity: 'epic',
    nameKey: 'items.badge.elite.name',
    descKey: 'items.badge.elite.desc',
    assetUrl: '/shop/badges/elite.png',
    defaultPriceAmount: 20,
    defaultPriceCurrency: 'gems',
  },
  'badge-mythic': {
    id: 'badge-mythic',
    category: 'badge',
    rarity: 'legendary',
    nameKey: 'items.badge.mythic.name',
    descKey: 'items.badge.mythic.desc',
    assetUrl: '/shop/badges/mythic.png',
    defaultPriceAmount: 50,
    defaultPriceCurrency: 'gems',
  },
  'badge-vanguard': {
    id: 'badge-vanguard',
    category: 'badge',
    rarity: 'epic',
    nameKey: 'items.badge.vanguard.name',
    descKey: 'items.badge.vanguard.desc',
    assetUrl: '/shop/badges/vanguard.png',
    defaultPriceAmount: 25,
    defaultPriceCurrency: 'gems',
  },
  'badge-nexus': {
    id: 'badge-nexus',
    category: 'badge',
    rarity: 'legendary',
    nameKey: 'items.badge.nexus.name',
    descKey: 'items.badge.nexus.desc',
    assetUrl: '/shop/badges/nexus.png',
    defaultPriceAmount: 60,
    defaultPriceCurrency: 'gems',
  },

  // Game skins — the in-match visual theme. No equip slot today (game_skin
  // is schema-only) but the catalog row + a free starter still ship so the
  // surface isn't empty and the player has something owned in the category.
  'game-skin-default': {
    id: 'game-skin-default',
    category: 'game_skin',
    rarity: 'common',
    nameKey: 'items.game_skin.default.name',
    descKey: 'items.game_skin.default.desc',
    assetUrl: '',
    colorValue: '#1e293b',
    defaultPriceAmount: 0,
    defaultPriceCurrency: 'coins',
    starter: true,
  },

  ...SHOP_COSMETIC_ITEMS,

  ...SHOP_BACKGROUND_ITEMS,
};

export const SHOP_CATALOG_IDS = Object.keys(SHOP_CATALOG);

export function getCatalogItem(id: string): ShopItemDef | null {
  return SHOP_CATALOG[id] ?? null;
}

export function listStarterItems(): ShopItemDef[] {
  return Object.values(SHOP_CATALOG).filter((item) => item.starter === true);
}
