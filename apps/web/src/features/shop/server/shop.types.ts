// Mirrors apps/be/src/shop/interfaces/shop-views.ts. Kept in sync by code review;
// a future ticket may auto-generate or share via a workspace package.

export type ShopCategory = 'avatar' | 'badge' | 'name_color' | 'game_skin';
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
};

export const EMPTY_INVENTORY: InventoryView = {
  items: [],
  equipped: EMPTY_EQUIPPED,
};
