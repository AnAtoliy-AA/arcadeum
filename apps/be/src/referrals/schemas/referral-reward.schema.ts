import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export const REWARD_TYPE_VALUES = ['badge', 'early_access'] as const;
export type RewardType = (typeof REWARD_TYPE_VALUES)[number];

@Schema({ timestamps: true })
export class ReferralReward extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  rewardId: string;

  @Prop({ required: true, type: String, enum: REWARD_TYPE_VALUES })
  rewardType: RewardType;

  @Prop({ type: Date, default: Date.now })
  unlockedAt: Date;

  @Prop({ required: true, type: Number })
  tier: number;

  createdAt: Date;
  updatedAt: Date;
}

export const ReferralRewardSchema =
  SchemaFactory.createForClass(ReferralReward);

ReferralRewardSchema.index({ userId: 1, rewardId: 1 }, { unique: true });
