import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GemPurchaseStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled';

@Schema({ timestamps: true })
export class GemPurchase {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'GemPackage' })
  packageId!: Types.ObjectId;

  @Prop({ required: true, unique: true })
  paypalOrderId!: string;

  /** Purchase amount in US cents. */
  @Prop({ required: true, type: Number })
  amountUsd!: number;

  @Prop({ required: true, type: Number, min: 1, max: 2_000_000 })
  gems!: number;

  @Prop({
    required: true,
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  })
  status!: GemPurchaseStatus;

  @Prop({ type: Types.ObjectId, ref: 'WalletTransaction' })
  walletTxId?: Types.ObjectId;

  @Prop()
  finalizedAt?: Date;
}

export type GemPurchaseDocument = GemPurchase & Document;
export const GemPurchaseSchema = SchemaFactory.createForClass(GemPurchase);
GemPurchaseSchema.index({ userId: 1, status: 1, createdAt: -1 });
