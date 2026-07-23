import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PlayerStatRecord {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  gameId!: string;

  @Prop({ required: true, enum: ['won', 'lost', 'draw'] })
  result!: string;

  @Prop({ required: true })
  sessionId!: string;

  @Prop({ required: true })
  timestamp!: number;
}

export type PlayerStatRecordDocument = PlayerStatRecord & Document;
export const PlayerStatRecordSchema =
  SchemaFactory.createForClass(PlayerStatRecord);

PlayerStatRecordSchema.index({ userId: 1, sessionId: 1 }, { unique: true });
