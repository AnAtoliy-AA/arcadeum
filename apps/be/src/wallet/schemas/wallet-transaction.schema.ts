import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  WALLET_CURRENCIES,
  WALLET_REASONS,
  type WalletCurrency,
  type WalletReason,
} from '../interfaces/wallet-types';

@Schema({ timestamps: true })
export class WalletTransaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: WALLET_CURRENCIES, required: true })
  currency!: WalletCurrency;

  @Prop({ type: Number, required: true })
  delta!: number;

  @Prop({ type: Number, required: true, min: 0 })
  balanceAfter!: number;

  @Prop({ type: String, enum: WALLET_REASONS, required: true })
  reason!: WalletReason;

  @Prop({ type: String, required: true, unique: true })
  idempotencyKey!: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export type WalletTransactionDocument = WalletTransaction & Document;
export const WalletTransactionSchema =
  SchemaFactory.createForClass(WalletTransaction);

WalletTransactionSchema.index({ userId: 1, createdAt: -1, _id: -1 });
WalletTransactionSchema.index({
  userId: 1,
  currency: 1,
  createdAt: -1,
  _id: -1,
});
