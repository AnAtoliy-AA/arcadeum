import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: false, _id: false })
export class ChessOpening {
  @Prop({ required: true })
  moves!: string[];

  @Prop({ required: true })
  fen!: string;

  @Prop({ default: 0 })
  white!: number;

  @Prop({ default: 0 })
  draws!: number;

  @Prop({ default: 0 })
  black!: number;

  @Prop({ default: 0 })
  totalGames!: number;

  @Prop({ default: 0 })
  avgRating!: number;

  @Prop({ default: '' })
  opening!: string;

  @Prop({ default: '' })
  openingFamily!: string;

  @Prop({ default: '' })
  eco!: string;
}

export type ChessOpeningDocument = ChessOpening & Document;
export const ChessOpeningSchema = SchemaFactory.createForClass(ChessOpening);

ChessOpeningSchema.index({ moves: 1 });
ChessOpeningSchema.index({ eco: 1 });
ChessOpeningSchema.index({ opening: 1 });
