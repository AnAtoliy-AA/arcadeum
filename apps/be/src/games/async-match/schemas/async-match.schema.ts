import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AsyncMatchDocument = AsyncMatch & Document;

@Schema({ timestamps: true, collection: 'async_matches' })
export class AsyncMatch {
  @Prop({ required: true, unique: true, index: true })
  matchId!: string;

  @Prop({ required: true, index: true })
  gameType!: string;

  @Prop({ required: true, index: true })
  playerA!: string;

  @Prop({ required: true, index: true })
  playerB!: string;

  @Prop({ required: true, index: true })
  currentTurnPlayerId!: string;

  @Prop({
    required: true,
    enum: ['active', 'completed', 'forfeited'],
    default: 'active',
    index: true,
  })
  status!: 'active' | 'completed' | 'forfeited';

  @Prop({ type: Object, default: {} })
  stateSnapshot!: Record<string, unknown>;

  @Prop({ type: Array, default: [] })
  movesHistory!: Array<Record<string, unknown>>;

  @Prop({ required: true, default: 24 })
  turnDurationHours!: number;

  @Prop({ required: true, default: Date.now })
  lastTurnAt!: Date;

  @Prop({ required: true, index: true })
  turnExpiresAt!: Date;

  @Prop({ required: false, default: null })
  winnerId?: string;
}

export const AsyncMatchSchema = SchemaFactory.createForClass(AsyncMatch);
AsyncMatchSchema.index({ playerA: 1, status: 1 });
AsyncMatchSchema.index({ playerB: 1, status: 1 });
AsyncMatchSchema.index({ status: 1, turnExpiresAt: 1 });
