import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export const REFERRAL_STATUS_VALUES = ['pending', 'completed'] as const;
export type ReferralStatus = (typeof REFERRAL_STATUS_VALUES)[number];

@Schema({ timestamps: true })
export class Referral extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, index: true })
  referrerId: string;

  @Prop({ required: true, unique: true, index: true })
  referredUserId: string;

  @Prop({
    required: true,
    type: String,
    enum: REFERRAL_STATUS_VALUES,
    default: 'completed',
  })
  status: ReferralStatus;

  @Prop({ type: Date, default: Date.now })
  completedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);
