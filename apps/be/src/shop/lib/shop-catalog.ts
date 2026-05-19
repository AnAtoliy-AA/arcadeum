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

  // Name colors. `assetUrl` is empty — the player-facing previews render a
  // color swatch from `colorValue` instead of an image. A `colorValue` may be
  // a hex string or a linear-gradient CSS expression for higher rarities.
  'name-color-slate': {
    id: 'name-color-slate',
    category: 'name_color',
    rarity: 'common',
    nameKey: 'items.name_color.slate.name',
    descKey: 'items.name_color.slate.desc',
    assetUrl: '',
    colorValue: '#94a3b8',
    defaultPriceAmount: 200,
    defaultPriceCurrency: 'coins',
  },
  'name-color-emerald': {
    id: 'name-color-emerald',
    category: 'name_color',
    rarity: 'common',
    nameKey: 'items.name_color.emerald.name',
    descKey: 'items.name_color.emerald.desc',
    assetUrl: '',
    colorValue: '#34d399',
    defaultPriceAmount: 300,
    defaultPriceCurrency: 'coins',
  },
  'name-color-cyan': {
    id: 'name-color-cyan',
    category: 'name_color',
    rarity: 'rare',
    nameKey: 'items.name_color.cyan.name',
    descKey: 'items.name_color.cyan.desc',
    assetUrl: '',
    colorValue: '#22d3ee',
    defaultPriceAmount: 2,
    defaultPriceCurrency: 'gems',
  },
  'name-color-violet': {
    id: 'name-color-violet',
    category: 'name_color',
    rarity: 'rare',
    nameKey: 'items.name_color.violet.name',
    descKey: 'items.name_color.violet.desc',
    assetUrl: '',
    colorValue: '#a78bfa',
    defaultPriceAmount: 3,
    defaultPriceCurrency: 'gems',
  },
  'name-color-sunset': {
    id: 'name-color-sunset',
    category: 'name_color',
    rarity: 'epic',
    nameKey: 'items.name_color.sunset.name',
    descKey: 'items.name_color.sunset.desc',
    assetUrl: '',
    colorValue: 'linear-gradient(90deg, #f97316 0%, #ec4899 100%)',
    defaultPriceAmount: 12,
    defaultPriceCurrency: 'gems',
  },
  'name-color-aurora': {
    id: 'name-color-aurora',
    category: 'name_color',
    rarity: 'legendary',
    nameKey: 'items.name_color.aurora.name',
    descKey: 'items.name_color.aurora.desc',
    assetUrl: '',
    colorValue: 'linear-gradient(90deg, #22d3ee 0%, #a78bfa 50%, #ec4899 100%)',
    defaultPriceAmount: 40,
    defaultPriceCurrency: 'gems',
  },

  // Banners — backdrop panel behind the avatar in profile / lobby surfaces.
  // Same swatch render path as name_color: `assetUrl` is empty and
  // `colorValue` holds the CSS (solid or linear-gradient). ItemAsset renders
  // a wide gradient tile from this value.
  'banner-slate': {
    id: 'banner-slate',
    category: 'banner',
    rarity: 'common',
    nameKey: 'items.banner.slate.name',
    descKey: 'items.banner.slate.desc',
    assetUrl: '',
    colorValue: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    defaultPriceAmount: 250,
    defaultPriceCurrency: 'coins',
  },
  'banner-tide': {
    id: 'banner-tide',
    category: 'banner',
    rarity: 'rare',
    nameKey: 'items.banner.tide.name',
    descKey: 'items.banner.tide.desc',
    assetUrl: '',
    colorValue: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
    defaultPriceAmount: 3,
    defaultPriceCurrency: 'gems',
  },
  'banner-twilight': {
    id: 'banner-twilight',
    category: 'banner',
    rarity: 'epic',
    nameKey: 'items.banner.twilight.name',
    descKey: 'items.banner.twilight.desc',
    assetUrl: '',
    colorValue: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
    defaultPriceAmount: 12,
    defaultPriceCurrency: 'gems',
  },
  'banner-nebula': {
    id: 'banner-nebula',
    category: 'banner',
    rarity: 'legendary',
    nameKey: 'items.banner.nebula.name',
    descKey: 'items.banner.nebula.desc',
    assetUrl: '',
    colorValue:
      'linear-gradient(135deg, #1e1b4b 0%, #6366f1 35%, #ec4899 70%, #f59e0b 100%)',
    defaultPriceAmount: 45,
    defaultPriceCurrency: 'gems',
  },

  // Auras — animated glow around the player's name. Reuses the colorValue
  // swatch pattern; the CSS animation hook lives in ItemAsset (catalog +
  // slot preview only — full live-name aura rendering ships in a follow-up).
  'aura-silver': {
    id: 'aura-silver',
    category: 'aura',
    rarity: 'common',
    nameKey: 'items.aura.silver.name',
    descKey: 'items.aura.silver.desc',
    assetUrl: '',
    colorValue: '#cbd5e1',
    defaultPriceAmount: 350,
    defaultPriceCurrency: 'coins',
  },
  'aura-cyan': {
    id: 'aura-cyan',
    category: 'aura',
    rarity: 'rare',
    nameKey: 'items.aura.cyan.name',
    descKey: 'items.aura.cyan.desc',
    assetUrl: '',
    colorValue: '#22d3ee',
    defaultPriceAmount: 4,
    defaultPriceCurrency: 'gems',
  },
  'aura-violet': {
    id: 'aura-violet',
    category: 'aura',
    rarity: 'epic',
    nameKey: 'items.aura.violet.name',
    descKey: 'items.aura.violet.desc',
    assetUrl: '',
    colorValue: '#a78bfa',
    defaultPriceAmount: 14,
    defaultPriceCurrency: 'gems',
  },
  'aura-prism': {
    id: 'aura-prism',
    category: 'aura',
    rarity: 'legendary',
    nameKey: 'items.aura.prism.name',
    descKey: 'items.aura.prism.desc',
    assetUrl: '',
    colorValue: 'linear-gradient(90deg, #22d3ee 0%, #a78bfa 50%, #ec4899 100%)',
    defaultPriceAmount: 55,
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
