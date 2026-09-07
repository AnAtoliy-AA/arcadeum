import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export const GAME_ROOM_STATUS_VALUES = [
  'lobby',
  'in_progress',
  'completed',
] as const;
export type GameRoomStatus = (typeof GAME_ROOM_STATUS_VALUES)[number];

export const GAME_ROOM_VISIBILITY_VALUES = ['public', 'private'] as const;
export type GameRoomVisibility = (typeof GAME_ROOM_VISIBILITY_VALUES)[number];

export interface GameRoomParticipant {
  userId: string;
  joinedAt: Date;
}

export interface GameRoomChatLog {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  scope: string;
  createdAt: string;
}

@Schema({ timestamps: true })
export class GameRoom extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  gameId: string;

  @Prop({ trim: true, index: true })
  category?: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  hostId: string;

  @Prop({ type: [String], default: [] })
  playerIds: string[];

  @Prop({
    type: [
      {
        userId: { type: String, required: true },
        joinedAt: { type: Date, required: true },
      },
    ],
    default: [],
  })
  participants: GameRoomParticipant[];

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

  @Prop({ type: String, trim: true, index: true, default: null })
  parentRoomId?: string | null;

  @Prop({ type: String, trim: true, index: true, default: null })
  rootRoomId?: string | null;

  @Prop({ type: String, trim: true, select: false })
  password?: string;

  @Prop({ type: Object, default: {} })
  gameOptions?: Record<string, unknown>;

  @Prop({ type: Boolean, default: false })
  rematchPending?: boolean;

  @Prop({ type: String, trim: true, index: true, default: null })
  tournamentId?: string | null;

  @Prop({
    type: [
      {
        id: { type: String, required: true },
        senderId: { type: String, required: true },
        senderName: { type: String, default: '' },
        message: { type: String, default: '' },
        scope: { type: String, default: 'all' },
        createdAt: { type: String, required: true },
      },
    ],
    default: [],
  })
  chatLogs: GameRoomChatLog[];

  createdAt: Date;
  updatedAt: Date;
}

export const GameRoomSchema = SchemaFactory.createForClass(GameRoom);

GameRoomSchema.index({ hostId: 1 });
GameRoomSchema.index({ status: 1, gameId: 1 });
GameRoomSchema.index({ 'participants.userId': 1 });
GameRoomSchema.index({ status: 1, updatedAt: -1 });
GameRoomSchema.index({ 'participants.userId': 1, updatedAt: -1 });
// Auto-delete lobby rooms after 7 days
GameRoomSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 7 * 24 * 60 * 60,
    partialFilterExpression: { status: 'lobby' },
  },
);
// Auto-delete completed/in_progress rooms after 30 days
GameRoomSchema.index(
  { updatedAt: 1 },
  {
    expireAfterSeconds: 30 * 24 * 60 * 60,
    partialFilterExpression: { status: { $in: ['completed', 'in_progress'] } },
  },
);
