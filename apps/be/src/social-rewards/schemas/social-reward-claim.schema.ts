import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'social_reward_claims', timestamps: true })
export class SocialRewardClaim extends Document {
  declare _id: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  platform: string;

  @Prop({ type: Number, required: true, min: 0 })
  gemsAwarded: number;

  @Prop({ type: Date, default: Date.now })
  claimedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export type SocialRewardClaimDocument = SocialRewardClaim;

export const SocialRewardClaimSchema =
  SchemaFactory.createForClass(SocialRewardClaim);

SocialRewardClaimSchema.index({ userId: 1, platform: 1 }, { unique: true });
