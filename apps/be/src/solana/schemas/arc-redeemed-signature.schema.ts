import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ArcRedeemedSignatureDocument =
  HydratedDocument<ArcRedeemedSignature>;

export type ArcRedemptionKind = 'gems' | 'shop';

/**
 * One row per on-chain ARC payment signature that has been turned into value.
 * The unique index is what stops a single deposit paying for both a gem pack
 * and a shop item, or for two different users.
 */
@Schema({ collection: 'arc_redeemed_signatures', timestamps: true })
export class ArcRedeemedSignature {
  @Prop({ required: true, unique: true })
  signature!: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, enum: ['gems', 'shop'] })
  kind!: ArcRedemptionKind;

  /** What the payment bought (package id or item id). */
  @Prop()
  subjectId?: string;
}

export const ArcRedeemedSignatureSchema =
  SchemaFactory.createForClass(ArcRedeemedSignature);
