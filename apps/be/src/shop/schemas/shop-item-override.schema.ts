import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  SHOP_PRICE_CURRENCIES,
  type ShopPriceCurrency,
} from '../lib/shop-types';

/**
 * Per-item admin override. Sparse: only the fields the admin has set are
 * stored. `null` (the default) means "use the catalog default."
 *
 * Mongoose's string-enum validator rejects `null` even when listed in the
 * enum array. So the enum is a clean `string[]` and the field is optional /
 * nullable at the type level; Mongoose only runs enum validation on non-null
 * values when `required: false`.
 */
@Schema({ timestamps: true, collection: 'shop_item_overrides' })
export class ShopItemOverride {
  @Prop({ required: true, unique: true, index: true })
  itemId!: string;

  @Prop({ type: Boolean, default: null })
  available?: boolean | null;

  @Prop({ type: Number, default: null, min: 0, max: 1_000_000 })
  priceAmount?: number | null;

  @Prop({ type: String, default: null, enum: SHOP_PRICE_CURRENCIES })
  priceCurrency?: ShopPriceCurrency | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  updatedBy?: Types.ObjectId | null;
}

export type ShopItemOverrideDocument = ShopItemOverride & Document;
export const ShopItemOverrideSchema =
  SchemaFactory.createForClass(ShopItemOverride);
