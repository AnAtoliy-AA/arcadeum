import type { ShopItemDef } from './shop-types';
import { NAME_COLORS } from './shop-catalog.name-colors';
import { BANNERS } from './shop-catalog.banners';
import { AURAS } from './shop-catalog.auras';
import { FRAMES } from './shop-catalog.frames';

/**
 * Color cosmetics — name colors, banners, auras, and frames. These use
 * `colorValue` (solid hex or linear-gradient) instead of an image asset.
 * Kept in separate modules so files stay under the length limit.
 */
export const SHOP_COSMETIC_ITEMS: Record<string, ShopItemDef> = {
  ...NAME_COLORS,
  ...BANNERS,
  ...AURAS,
  ...FRAMES,
};
