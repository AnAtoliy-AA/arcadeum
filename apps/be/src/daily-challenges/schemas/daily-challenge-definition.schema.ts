import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const CHALLENGE_TYPE_VALUES = [
  'play_games',
  'win_games',
  'play_specific_game',
  'sink_ships',
  'win_streak',
  'play_without_firing',
  'total_shots',
] as const;
export type ChallengeType = (typeof CHALLENGE_TYPE_VALUES)[number];

export const CHALLENGE_REWARD_TYPE_VALUES = ['coins', 'gems'] as const;
export type ChallengeRewardType = (typeof CHALLENGE_REWARD_TYPE_VALUES)[number];

@Schema({ collection: 'daily_challenge_definitions', timestamps: true })
export class DailyChallengeDefinition extends Document {
  declare _id: import('mongoose').Types.ObjectId;

  @Prop({ type: String, required: true, unique: true, index: true })
  challengeId!: string;

  @Prop({ type: String, enum: CHALLENGE_TYPE_VALUES, required: true })
  type!: ChallengeType;

  @Prop({ type: String })
  gameId?: string;

  @Prop({ type: Number, required: true })
  targetCount!: number;

  @Prop({ type: String, enum: CHALLENGE_REWARD_TYPE_VALUES, required: true })
  rewardType!: ChallengeRewardType;

  @Prop({ type: Number, required: true })
  rewardAmount!: number;

  @Prop({ type: Number, required: true, min: 1, max: 7 })
  dayInWeek!: number;

  createdAt: Date;
  updatedAt: Date;
}

export type DailyChallengeDefinitionDocument = DailyChallengeDefinition;
export const DailyChallengeDefinitionSchema = SchemaFactory.createForClass(
  DailyChallengeDefinition,
);
