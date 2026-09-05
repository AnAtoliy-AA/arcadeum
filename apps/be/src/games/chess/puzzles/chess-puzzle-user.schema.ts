import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ChessPuzzleUser {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, index: true })
  puzzleId!: string;

  @Prop({ required: true })
  solved!: boolean;

  @Prop({ required: true })
  attemptedAt!: Date;

  @Prop({ default: 0 })
  timeMs!: number;
}

export type ChessPuzzleUserDocument = ChessPuzzleUser & Document;
export const ChessPuzzleUserSchema =
  SchemaFactory.createForClass(ChessPuzzleUser);

ChessPuzzleUserSchema.index({ userId: 1, puzzleId: 1 }, { unique: true });
ChessPuzzleUserSchema.index({ userId: 1, solved: 1, attemptedAt: -1 });
