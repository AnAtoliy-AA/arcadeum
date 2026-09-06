import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChessProfileDocument = HydratedDocument<ChessProfile>;

@Schema({ timestamps: true, collection: 'chess_profiles' })
export class ChessProfile {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ default: '', maxlength: 500 })
  bio!: string;

  @Prop({ default: '' })
  country!: string;

  @Prop({ default: '' })
  title!: string;

  @Prop({ type: Object, default: {} })
  perGameStats!: Record<
    string,
    {
      games: number;
      wins: number;
      losses: number;
      draws: number;
      elo: number;
      peakElo: number;
      winStreak: number;
      currentStreak: number;
    }
  >;

  @Prop({ default: 1200 })
  puzzleRating!: number;

  @Prop({ default: 0 })
  totalPuzzlesSolved!: number;

  @Prop({ type: [String], default: [] })
  recentGames!: string[];

  @Prop({ default: '' })
  favoriteOpening!: string;

  @Prop({ default: '' })
  playStyle!: string;
}

export const ChessProfileSchema = SchemaFactory.createForClass(ChessProfile);
