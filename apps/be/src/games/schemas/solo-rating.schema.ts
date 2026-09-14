import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  RANKING_TIER_VALUES,
  type RankingTier,
} from '../../ranking/ranking.constants';

/**
 * Global solo-game rating for a user. One document per user.
 * Updated every time a solo game result is synced.
 */
@Schema({ timestamps: true })
export class SoloRating {
  @Prop({ required: true, index: true, unique: true })
  userId!: string;

  @Prop({ default: 1200 })
  rating!: number;

  @Prop({ default: 1200 })
  peakRating!: number;

  @Prop({ type: String, enum: RANKING_TIER_VALUES, default: 'bronze' })
  tier!: RankingTier;

  @Prop({ default: 0 })
  wins!: number;

  @Prop({ default: 0 })
  losses!: number;

  @Prop({ default: 0 })
  winsWithUndo!: number;

  @Prop({ default: 0 })
  lossesWithUndo!: number;

  @Prop({ default: 0 })
  totalGames!: number;
}

export type SoloRatingDocument = SoloRating & Document;
export const SoloRatingSchema = SchemaFactory.createForClass(SoloRating);

SoloRatingSchema.index({ rating: -1 });
