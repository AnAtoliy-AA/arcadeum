import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: false, _id: false })
export class ChessPuzzle {
  @Prop({ required: true })
  puzzleId!: string;

  @Prop({ required: true })
  fen!: string;

  @Prop({ required: true })
  moves!: string[];

  @Prop({ required: true })
  rating!: number;

  @Prop({ default: 0 })
  ratingDeviation!: number;

  @Prop({ type: [String], default: [] })
  themes!: string[];

  @Prop({ type: [String], default: [] })
  openingTags!: string[];

  @Prop({ default: 0 })
  plays!: number;

  @Prop({ default: 0 })
  solutions!: number;

  @Prop({ default: false })
  isCustom!: boolean;

  @Prop({ required: false })
  authorId?: string;

  @Prop({ required: false })
  title?: string;

  @Prop({ required: false })
  description?: string;
}

export type ChessPuzzleDocument = ChessPuzzle & Document;
export const ChessPuzzleSchema = SchemaFactory.createForClass(ChessPuzzle);

ChessPuzzleSchema.index({ puzzleId: 1 }, { unique: true });
ChessPuzzleSchema.index({ rating: 1 });
ChessPuzzleSchema.index({ themes: 1 });
ChessPuzzleSchema.index({ openingTags: 1 });
ChessPuzzleSchema.index({ authorId: 1 });
ChessPuzzleSchema.index({ isCustom: 1 });
