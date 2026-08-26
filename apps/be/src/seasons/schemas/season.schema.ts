import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SeasonStatus = 'active' | 'archived';
export const SEASON_STATUSES: readonly SeasonStatus[] = [
  'active',
  'archived',
] as const;

export type SeasonTheme =
  | 'ember'
  | 'tides'
  | 'frost'
  | 'bloom'
  | 'eclipse'
  | 'aurora'
  | 'dawn'
  | 'dusk';
export const SEASON_THEMES: readonly SeasonTheme[] = [
  'ember',
  'tides',
  'frost',
  'bloom',
  'eclipse',
  'aurora',
  'dawn',
  'dusk',
] as const;

export type SeasonRewardKind = 'badge' | 'boardSkin' | 'pieceDesign';
export const SEASON_REWARD_KINDS: readonly SeasonRewardKind[] = [
  'badge',
  'boardSkin',
  'pieceDesign',
] as const;

/** Cosmetic reward granted to every player finishing a season within rankFrom..rankTo. */
@Schema({ _id: false })
export class SeasonRewardTier {
  @Prop({ required: true })
  rankFrom!: number;

  @Prop({ required: true })
  rankTo!: number;

  @Prop({ required: true })
  rewardId!: string;

  @Prop({ type: String, required: true, enum: SEASON_REWARD_KINDS })
  kind!: SeasonRewardKind;

  @Prop({ required: true, maxlength: 60 })
  icon!: string;

  /** Static palette hex (mirrors the genre/role palettes used across the app). */
  @Prop({ required: true, maxlength: 16 })
  color!: string;
}
export const SeasonRewardTierSchema =
  SchemaFactory.createForClass(SeasonRewardTier);

/** Per-game champion snapshot captured when a season rolls over. */
@Schema({ _id: false })
export class SeasonChampion {
  @Prop({ required: true, index: true })
  gameId!: string;

  /** User id as a plain string, matching `RankingEntry.userId`. */
  @Prop({ required: true })
  userId!: string;

  @Prop({ type: String, default: null })
  username!: string | null;

  @Prop({ required: true })
  elo!: number;
}
export const SeasonChampionSchema =
  SchemaFactory.createForClass(SeasonChampion);

/**
 * One competitive season. Seasons are quarters (e.g. `2026Q3`) so they line
 * up with the per-season keys already stamped on `RankingEntry` documents.
 */
@Schema({ timestamps: true, collection: 'seasons' })
export class Season {
  /** Quarter stamp, e.g. `2026Q3` — unique. */
  @Prop({ required: true, unique: true, index: true })
  seasonId!: string;

  /** Sequential number starting at 1 for 2026Q1. */
  @Prop({ required: true, index: true })
  number!: number;

  @Prop({
    type: String,
    required: true,
    enum: SEASON_STATUSES,
    default: 'active',
    index: true,
  })
  status!: SeasonStatus;

  @Prop({ type: String, required: true, enum: SEASON_THEMES })
  theme!: SeasonTheme;

  @Prop({ type: Date, required: true })
  startsAt!: Date;

  @Prop({ type: Date, required: true })
  endsAt!: Date;

  @Prop({ type: [SeasonRewardTierSchema], default: [] })
  rewardTiers!: SeasonRewardTier[];

  /** Filled by the rollover job once the season ends. */
  @Prop({ type: [SeasonChampionSchema], default: [] })
  champions!: SeasonChampion[];

  @Prop({ type: Date, default: null })
  archivedAt!: Date | null;
}

export type SeasonDocument = Season & Document;
export const SeasonSchema = SchemaFactory.createForClass(Season);

SeasonSchema.index({ status: 1, endsAt: -1 });
