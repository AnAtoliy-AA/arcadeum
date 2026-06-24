import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  SHOP_ACQUIRED_VIA,
  SHOP_PRICE_CURRENCIES,
  type ShopAcquiredVia,
  type ShopPriceCurrency,
} from '../lib/shop-types';

/**
 * A single inventory row owned by a user. Soft-deleted via `soldAt`; rows
 * are never hard-deleted so the ledger of purchases / sells / grants stays
 * intact for support and economy analysis.
 *
 * `purchaseId` is the dedup token. For self-purchases it is a client-supplied
 * UUID v4; for starter grants it is `starter-${userId}-${itemId}` (stable for
 * idempotency under bootstrap re-runs); for admin grants it is
 * `shop-grant-${nonce}` where the admin dialog supplies a fresh UUID per open.
 */
@Schema({ timestamps: true, collection: 'user_inventory_items' })
export class UserInventoryItem {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  itemId!: string;

  @Prop({ required: true })
  purchaseId!: string;

  @Prop({ type: String, enum: SHOP_ACQUIRED_VIA, required: true })
  acquiredVia!: ShopAcquiredVia;

  @Prop({ type: Number, default: null })
  paidAmount?: number | null;

  @Prop({ type: String, default: null, enum: SHOP_PRICE_CURRENCIES })
  paidCurrency?: ShopPriceCurrency | null;

  @Prop({ type: Date, default: null })
  soldAt?: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  adminUserId?: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  adminReason?: string | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  revokedBy?: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  revokedReason?: string | null;

  @Prop({ type: String, default: null })
  walletSignature?: string | null;

  @Prop({ type: String, default: null })
  walletSender?: string | null;
}

export type UserInventoryItemDocument = UserInventoryItem & Document;
export const UserInventoryItemSchema =
  SchemaFactory.createForClass(UserInventoryItem);

UserInventoryItemSchema.index({ userId: 1, purchaseId: 1 }, { unique: true });
UserInventoryItemSchema.index({ userId: 1, itemId: 1, soldAt: 1 });
