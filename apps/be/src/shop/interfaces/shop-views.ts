import type { Types } from 'mongoose';
import type {
  ShopAcquiredVia,
  ShopCategory,
  ShopPriceCurrency,
} from '../lib/shop-types';

export type { EffectiveShopItem } from '../lib/shop-types';

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

export interface GrantResult {
  inventoryItem: InventoryItemView;
}

export interface GiftResult {
  inventoryItem: InventoryItemView;
}

export interface RevokeResult {
  inventoryItem: InventoryItemView;
  equipped: EquippedView;
}

export function toUserIdString(value: Types.ObjectId | string): string {
  return typeof value === 'string' ? value : value.toString();
}

export interface LeanUser {
  _id: Types.ObjectId;
  coins?: number;
  gems?: number;
  equippedAvatarId?: string | null;
  equippedBadgeId?: string | null;
  equippedNameColorId?: string | null;
  equippedBannerId?: string | null;
  equippedAuraId?: string | null;
  equippedFrameId?: string | null;
  equippedGameSkinId?: string | null;
  equippedBackgroundId?: string | null;
}

export interface InventoryRowSnapshot {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  itemId: string;
  purchaseId: string;
  acquiredVia: 'coins' | 'gems' | 'grant' | 'starter';
  paidAmount?: number | null;
  paidCurrency?: 'coins' | 'gems' | null;
  soldAt?: Date | null;
  createdAt?: Date;
}
