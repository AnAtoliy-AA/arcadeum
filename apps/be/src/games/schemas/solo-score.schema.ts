import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SoloScore {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, index: true })
  gameId!: string;

  @Prop({ required: true })
  difficulty!: string;

  @Prop({ required: true })
  score!: number;

  @Prop({ default: 0 })
  moves!: number;

  @Prop({ default: 0 })
  durationMs!: number;

  @Prop({ required: true, enum: ['won', 'lost'] })
  result!: string;

  @Prop({ required: true })
  sessionId!: string;

  @Prop({ required: true })
  timestamp!: number;
}

export type SoloScoreDocument = SoloScore & Document;
export const SoloScoreSchema = SchemaFactory.createForClass(SoloScore);

SoloScoreSchema.index(
  { userId: 1, gameId: 1, difficulty: 1, sessionId: 1 },
  { unique: true },
);
SoloScoreSchema.index({ gameId: 1, difficulty: 1, score: -1 });
SoloScoreSchema.index({ gameId: 1, difficulty: 1, durationMs: 1 });
SoloScoreSchema.index({ userId: 1, gameId: 1, difficulty: 1, score: -1 });
