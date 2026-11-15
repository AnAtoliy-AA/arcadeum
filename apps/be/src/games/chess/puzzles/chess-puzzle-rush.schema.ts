import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type ChessPuzzleRushDocument = HydratedDocument<ChessPuzzleRush>;

@Schema({ timestamps: true, collection: 'chess_puzzle_rush_runs' })
export class ChessPuzzleRush {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  username!: string;

  @Prop({ required: false, default: '' })
  avatar?: string;

  @Prop({ required: true, enum: ['survival', 'timed'], index: true })
  mode!: 'survival' | 'timed';

  @Prop({ required: true, index: true })
  score!: number;

  @Prop({ required: true, default: 0 })
  bestStreak!: number;

  @Prop({ required: true, default: 0 })
  totalTimeSeconds!: number;

  @Prop({ required: false, default: 1200 })
  rating!: number;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const ChessPuzzleRushSchema =
  SchemaFactory.createForClass(ChessPuzzleRush);

ChessPuzzleRushSchema.index({ mode: 1, score: -1, totalTimeSeconds: 1 });
ChessPuzzleRushSchema.index({ userId: 1, mode: 1 });
