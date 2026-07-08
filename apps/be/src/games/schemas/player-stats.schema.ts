import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PlayerStats {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, index: true })
  gameId!: string;

  @Prop({ default: 0 })
  totalGames!: number;

  @Prop({ default: 0 })
  wins!: number;

  @Prop({ default: 0 })
  losses!: number;

  @Prop({ default: 0 })
  draws!: number;
}

export type PlayerStatsDocument = PlayerStats & Document;
export const PlayerStatsSchema = SchemaFactory.createForClass(PlayerStats);

PlayerStatsSchema.index({ userId: 1, gameId: 1 }, { unique: true });
PlayerStatsSchema.index({ gameId: 1, wins: -1 });
