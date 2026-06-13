import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const ACHIEVEMENT_CATEGORY_VALUES = [
  'gameplay',
  'social',
  'collection',
  'competitive',
] as const;
export type AchievementCategory = (typeof ACHIEVEMENT_CATEGORY_VALUES)[number];

export const ACHIEVEMENT_RARITY_VALUES = [
  'common',
  'rare',
  'epic',
  'legendary',
] as const;
export type AchievementRarity = (typeof ACHIEVEMENT_RARITY_VALUES)[number];

@Schema({ collection: 'achievement_definitions', timestamps: true })
export class AchievementDefinition extends Document {
  declare _id: import('mongoose').Types.ObjectId;

  @Prop({ type: String, required: true, unique: true, index: true })
  achievementId!: string;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String, required: true })
  description!: string;

  @Prop({
    type: String,
    enum: ACHIEVEMENT_CATEGORY_VALUES,
    required: true,
  })
  category!: AchievementCategory;

  @Prop({
    type: String,
    enum: ACHIEVEMENT_RARITY_VALUES,
    required: true,
  })
  rarity!: AchievementRarity;

  @Prop({ type: Number, required: true, default: 100 })
  xpReward!: number;

  @Prop({ type: Number, required: true, default: 0 })
  coinReward!: number;

  @Prop({ type: Number, required: true, default: 0 })
  gemReward!: number;

  @Prop({ type: String })
  iconUrl?: string;

  @Prop({ type: Number, required: true, default: 1 })
  sortOrder!: number;

  createdAt: Date;
  updatedAt: Date;
}

export type AchievementDefinitionDocument = AchievementDefinition;
export const AchievementDefinitionSchema = SchemaFactory.createForClass(
  AchievementDefinition,
);
