// Mirrors apps/be/src/shop/* response shapes for admin endpoints.

import type {
  EffectiveShopItem,
  InventoryItemView,
  EquippedView,
  ShopPriceCurrency,
} from '@/features/shop/server/shop.types';

export type { EffectiveShopItem };

export interface ShopItemOverrideView {
  itemId: string;
  available: boolean | null;
  priceAmount: number | null;
  priceCurrency: ShopPriceCurrency | null;
  updatedAt: string | null;
}

export interface AdminUserInventoryView {
  items: InventoryItemView[];
  equipped: EquippedView;
}
