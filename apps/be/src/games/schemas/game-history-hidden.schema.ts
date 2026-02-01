import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class GameHistoryHidden extends Document {
  @Prop({ required: true, trim: true, index: true })
  userId: string;

  @Prop({ required: true, trim: true, index: true })
  roomId: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const GameHistoryHiddenSchema =
  SchemaFactory.createForClass(GameHistoryHidden);

GameHistoryHiddenSchema.index({ userId: 1, roomId: 1 }, { unique: true });
