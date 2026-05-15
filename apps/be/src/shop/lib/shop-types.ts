export const SHOP_CATEGORIES = [
  'avatar',
  'badge',
  'name_color',
  'game_skin',
] as const;
export type ShopCategory = (typeof SHOP_CATEGORIES)[number];

export const SHOP_RARITIES = ['common', 'rare', 'epic', 'legendary'] as const;
export type ShopRarity = (typeof SHOP_RARITIES)[number];

export const SHOP_PRICE_CURRENCIES = ['coins', 'gems'] as const;
export type ShopPriceCurrency = (typeof SHOP_PRICE_CURRENCIES)[number];

export const SHOP_ACQUIRED_VIA = ['coins', 'gems', 'grant', 'starter'] as const;
export type ShopAcquiredVia = (typeof SHOP_ACQUIRED_VIA)[number];

export interface ShopItemDef {
  id: string;
  category: ShopCategory;
  rarity: ShopRarity;
  nameKey: string;
  descKey: string;
  assetUrl: string;
  /**
   * Category-specific value. For `name_color` items it carries a CSS color
   * string (hex or linear-gradient) applied to the player's name across the
   * site; unused for other categories.
   */
  colorValue?: string | null;
  defaultPriceAmount: number;
  defaultPriceCurrency: ShopPriceCurrency;
  starter?: boolean;
}

export interface EffectiveShopItem extends ShopItemDef {
  available: boolean;
  priceAmount: number;
  priceCurrency: ShopPriceCurrency;
  overridden: boolean;
}

export function isShopCategory(value: string): value is ShopCategory {
  return (SHOP_CATEGORIES as readonly string[]).includes(value);
}

export function isShopRarity(value: string): value is ShopRarity {
  return (SHOP_RARITIES as readonly string[]).includes(value);
}

export function isShopPriceCurrency(value: string): value is ShopPriceCurrency {
  return (SHOP_PRICE_CURRENCIES as readonly string[]).includes(value);
}

export type EquipKey =
  | 'equippedAvatarId'
  | 'equippedBadgeId'
  | 'equippedNameColorId';

export function equipKeyFor(category: ShopCategory): EquipKey | null {
  if (category === 'avatar') return 'equippedAvatarId';
  if (category === 'badge') return 'equippedBadgeId';
  if (category === 'name_color') return 'equippedNameColorId';
  return null;
}
