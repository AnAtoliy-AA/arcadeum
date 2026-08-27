import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export interface ReplayPlayer {
  id: string;
  displayName: string;
  role?: string;
}

export interface ReplayAction {
  action: string;
  userId: string;
  payload?: unknown;
  timestamp: string;
}

export interface ReplayResult {
  winnerIds: string[];
  isDraw: boolean;
}

@Schema({ timestamps: true })
export class GameReplay extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  replayId: string;

  @Prop({ required: true, index: true })
  roomId: string;

  @Prop({ required: true })
  sessionId: string;

  @Prop({ required: true, index: true })
  gameId: string;

  @Prop({ type: [String], required: true })
  playerIds: string[];

  @Prop({ type: SchemaTypes.Mixed, required: true })
  players: ReplayPlayer[];

  @Prop({ type: SchemaTypes.Mixed, required: true })
  initialState: Record<string, unknown>;

  @Prop({ type: SchemaTypes.Mixed, required: true })
  actions: ReplayAction[];

  @Prop({ type: SchemaTypes.Mixed })
  result?: ReplayResult;

  @Prop({ type: SchemaTypes.Mixed })
  gameOptions?: Record<string, unknown>;

  @Prop({ required: true })
  totalMoves: number;

  @Prop({ required: true })
  durationMs: number;

  createdAt: Date;
  updatedAt: Date;
}

export const GameReplaySchema = SchemaFactory.createForClass(GameReplay);

GameReplaySchema.index({ playerIds: 1, createdAt: -1 });
GameReplaySchema.index({ gameId: 1, createdAt: -1 });
GameReplaySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 180 * 24 * 60 * 60 },
);
