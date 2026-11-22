import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CommunityChallengeDocument = CommunityChallenge & Document;

export const COMMUNITY_CHALLENGE_STATUSES = [
  'active',
  'completed',
  'upcoming',
] as const;
export type CommunityChallengeStatus =
  (typeof COMMUNITY_CHALLENGE_STATUSES)[number];

@Schema({ timestamps: true })
export class CommunityChallenge {
  @Prop({ required: true, index: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true, default: 'all', index: true })
  gameId!: string;

  @Prop({ required: true, default: 5000 })
  target!: number;

  @Prop({ required: true, default: 0 })
  currentProgress!: number;

  @Prop({ required: true, default: 0 })
  participantsCount!: number;

  @Prop({ required: true, default: 'Vanguard' })
  rewardTitle!: string;

  @Prop({ required: true, default: 'trophy_gold' })
  rewardBadge!: string;

  @Prop({ required: true, default: () => new Date() })
  startDate!: Date;

  @Prop({
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })
  endDate!: Date;

  @Prop({
    type: String,
    enum: COMMUNITY_CHALLENGE_STATUSES,
    default: 'active',
    index: true,
  })
  status!: CommunityChallengeStatus;
}

export const CommunityChallengeSchema =
  SchemaFactory.createForClass(CommunityChallenge);

CommunityChallengeSchema.index({ status: 1, endDate: 1 });
