import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RANKING_TIER_VALUES, type RankingTier } from './ranking.constants';

/**
 * Per-game, per-season ranked rating for a user. One document per
 * `{ gameId, season, userId }`. Only ranked matches write here; casual
 * matches only update `PlayerStats` wins/losses/draws.
 */
@Schema({ timestamps: true })
export class RankingEntry {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, index: true })
  gameId!: string;

  @Prop({ required: true, index: true })
  season!: string;

  @Prop({ default: 1200 })
  elo!: number;

  @Prop({ type: String, enum: RANKING_TIER_VALUES, default: 'bronze' })
  tier!: RankingTier;

  @Prop({ default: 1200 })
  peakElo!: number;

  @Prop({ default: 0 })
  wins!: number;

  @Prop({ default: 0 })
  losses!: number;

  @Prop({ default: 0 })
  draws!: number;

  @Prop({ default: 0 })
  rankedGames!: number;
}

export type RankingEntryDocument = RankingEntry & Document;
export const RankingEntrySchema = SchemaFactory.createForClass(RankingEntry);

RankingEntrySchema.index({ gameId: 1, season: 1, userId: 1 }, { unique: true });
RankingEntrySchema.index({ gameId: 1, season: 1, elo: -1 });
