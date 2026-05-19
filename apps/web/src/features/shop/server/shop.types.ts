// Mirrors apps/be/src/shop/interfaces/shop-views.ts. Kept in sync by code review;
// a future ticket may auto-generate or share via a workspace package.

export type ShopCategory =
  | 'avatar'
  | 'badge'
  | 'name_color'
  | 'game_skin'
  | 'banner'
  | 'aura';
export type ShopRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type ShopPriceCurrency = 'coins' | 'gems';
export type ShopAcquiredVia = 'coins' | 'gems' | 'grant' | 'starter';

export interface EffectiveShopItem {
  id: string;
  category: ShopCategory;
  rarity: ShopRarity;
  nameKey: string;
  descKey: string;
  assetUrl: string;
  /**
   * Category-specific value. For `name_color` items it carries a CSS color
   * string (hex or linear-gradient) applied to the player's name; unused
   * for other categories.
   */
  colorValue?: string | null;
  defaultPriceAmount: number;
  defaultPriceCurrency: ShopPriceCurrency;
  starter?: boolean;
  available: boolean;
  priceAmount: number;
  priceCurrency: ShopPriceCurrency;
  overridden: boolean;
}

export interface InventoryItemView {
  rowId: string;
  itemId: string;
  purchaseId: string;
  acquiredVia: ShopAcquiredVia;
  paidAmount: number | null;
  paidCurrency: ShopPriceCurrency | null;
  soldAt: string | null;
  createdAt: string;
}

export type EquippedView = Record<ShopCategory, string | null>;

export interface InventoryView {
  items: InventoryItemView[];
  equipped: EquippedView;
}

export interface WalletBalanceView {
  coins: number;
  gems: number;
}

export interface PurchaseResult {
  inventoryItem: InventoryItemView;
  equipped: EquippedView;
  balance: WalletBalanceView;
}

export interface SellResult {
  rowId: string;
  refundAmount: number;
  refundCurrency: 'coins';
  balance: WalletBalanceView;
}

export interface CatalogFilter {
  category?: ShopCategory;
  rarity?: ShopRarity;
}

export const EMPTY_EQUIPPED: EquippedView = {
  avatar: null,
  badge: null,
  name_color: null,
  game_skin: null,
  banner: null,
  aura: null,
};

export const EMPTY_INVENTORY: InventoryView = {
  items: [],
  equipped: EMPTY_EQUIPPED,
};

// ─── FE-only view models (derived on the server, not BE-shared) ──────────────

export interface NextGemPackView {
  label: string;
  target: number;
}

export interface FeaturedDropView {
  itemId: string;
  endsAtIso: string | null;
}
