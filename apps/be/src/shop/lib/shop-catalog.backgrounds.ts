import type { ShopItemDef } from './shop-types';

/**
 * Avatar disc backgrounds — the radial wash painted behind the avatar art,
 * inside the frame ring. `colorValue` is a solid hex or a linear-gradient,
 * matching the aura/frame/banner convention. Kept in a sibling module so the
 * main `shop-catalog.ts` stays under the file-length limit.
 */
export const SHOP_BACKGROUND_ITEMS: Record<string, ShopItemDef> = {
  'background-default': {
    id: 'background-default',
    category: 'background',
    rarity: 'common',
    nameKey: 'items.background.default.name',
    descKey: 'items.background.default.desc',
    assetUrl: '',
    colorValue: '#1e293b',
    defaultPriceAmount: 0,
    defaultPriceCurrency: 'coins',
    starter: true,
  },
  'background-slate': {
    id: 'background-slate',
    category: 'background',
    rarity: 'common',
    nameKey: 'items.background.slate.name',
    descKey: 'items.background.slate.desc',
    assetUrl: '',
    colorValue: '#334155',
    defaultPriceAmount: 300,
    defaultPriceCurrency: 'coins',
  },
  'background-ocean': {
    id: 'background-ocean',
    category: 'background',
    rarity: 'rare',
    nameKey: 'items.background.ocean.name',
    descKey: 'items.background.ocean.desc',
    assetUrl: '',
    colorValue: 'linear-gradient(135deg, #0e7490 0%, #1e3a8a 100%)',
    defaultPriceAmount: 4,
    defaultPriceCurrency: 'gems',
  },
  'background-violet': {
    id: 'background-violet',
    category: 'background',
    rarity: 'epic',
    nameKey: 'items.background.violet.name',
    descKey: 'items.background.violet.desc',
    assetUrl: '',
    colorValue: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
    defaultPriceAmount: 14,
    defaultPriceCurrency: 'gems',
  },
  'background-aurora': {
    id: 'background-aurora',
    category: 'background',
    rarity: 'legendary',
    nameKey: 'items.background.aurora.name',
    descKey: 'items.background.aurora.desc',
    assetUrl: '',
    colorValue:
      'linear-gradient(135deg, #0e7490 0%, #7c3aed 50%, #db2777 100%)',
    defaultPriceAmount: 50,
    defaultPriceCurrency: 'gems',
  },
};
