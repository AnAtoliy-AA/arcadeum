import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const GAME_MODE_VALUES = [
  'all',
  'critical',
  'sea_battle',
  'texas_holdem',
  'tic_tac_toe',
] as const;
export type GameMode = (typeof GAME_MODE_VALUES)[number];

export const REGION_VALUES = [
  'na',
  'eu',
  'sa',
  'asia',
  'oceania',
  'africa',
  'me',
] as const;
export type Region = (typeof REGION_VALUES)[number];

export const TIER_VALUES = [
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
  'mythic',
] as const;
export type Tier = (typeof TIER_VALUES)[number];

export const FORM_RESULT_VALUES = ['W', 'L', 'D'] as const;
export type FormResult = (typeof FORM_RESULT_VALUES)[number];

@Schema({ timestamps: true })
export class LeaderboardEntry {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, type: String, enum: GAME_MODE_VALUES, index: true })
  mode!: GameMode;

  @Prop({ required: true, index: true })
  season!: string;

  @Prop({ required: true })
  username!: string;

  @Prop({ type: String, enum: REGION_VALUES, required: true })
  region!: Region;

  @Prop({ type: String })
  countryCode?: string;

  @Prop({ type: String, enum: TIER_VALUES, required: true })
  tier!: Tier;

  @Prop({ required: true, index: true })
  rating!: number;

  @Prop({ type: Number })
  elo?: number;

  @Prop({ default: 0 })
  wins!: number;

  @Prop({ default: 0 })
  losses!: number;

  @Prop({ default: 0 })
  draws!: number;

  @Prop({ type: [String], default: [] })
  recentForm!: FormResult[];

  @Prop({ default: 0 })
  streak!: number;

  @Prop({ default: false })
  isOnline!: boolean;

  @Prop({ default: false })
  isInMatch!: boolean;

  @Prop({ type: [String], default: [] })
  gameTags!: string[];

  // Snapshot: the rank from the previous capture, used to compute trend/climbers/fallers.
  @Prop({ type: Number })
  prevRank?: number;

  // Snapshot: cached current rank from the most recent capture.
  @Prop({ type: Number })
  rank?: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export type LeaderboardEntryDocument = LeaderboardEntry & Document;
export const LeaderboardEntrySchema =
  SchemaFactory.createForClass(LeaderboardEntry);

LeaderboardEntrySchema.index(
  { mode: 1, season: 1, userId: 1 },
  { unique: true },
);
LeaderboardEntrySchema.index({ mode: 1, season: 1, rating: -1 });
