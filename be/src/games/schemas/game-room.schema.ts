import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const GAME_ROOM_STATUS_VALUES = [
  'lobby',
  'in_progress',
  'completed',
] as const;
export type GameRoomStatus = (typeof GAME_ROOM_STATUS_VALUES)[number];

export const GAME_ROOM_VISIBILITY_VALUES = ['public', 'private'] as const;
export type GameRoomVisibility = (typeof GAME_ROOM_VISIBILITY_VALUES)[number];

@Schema({ timestamps: true })
export class GameRoom extends Document {
  @Prop({ required: true, trim: true })
  gameId: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  hostId: string;

  @Prop({ type: [String], default: [] })
  playerIds: string[];

  @Prop({
    required: true,
    type: String,
    enum: GAME_ROOM_VISIBILITY_VALUES,
    default: 'public',
  })
  visibility: GameRoomVisibility;

  @Prop({ type: Number, min: 2 })
  maxPlayers?: number;

  @Prop({ trim: true })
  notes?: string;

  @Prop({
    required: true,
    type: String,
    enum: GAME_ROOM_STATUS_VALUES,
    default: 'lobby',
  })
  status: GameRoomStatus;

  @Prop({ unique: true, sparse: true, trim: true })
  inviteCode?: string;

  @Prop({ type: Boolean, default: false })
  historyHiddenForAll?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const GameRoomSchema = SchemaFactory.createForClass(GameRoom);
