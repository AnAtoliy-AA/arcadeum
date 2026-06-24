import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Per-user Battle Pass progress for a season. XP is derived read-only from match
 * history, so the only persisted state is which reward tiers the player has
 * already claimed.
 */
@Schema({ timestamps: true })
export class BattlePassProgress {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, index: true })
  seasonId!: string;

  @Prop({ type: [Number], default: [] })
  claimedTiers!: number[];
}

export type BattlePassProgressDocument = BattlePassProgress & Document;

export const BattlePassProgressSchema =
  SchemaFactory.createForClass(BattlePassProgress);

// One progress doc per user per season.
BattlePassProgressSchema.index({ userId: 1, seasonId: 1 }, { unique: true });
