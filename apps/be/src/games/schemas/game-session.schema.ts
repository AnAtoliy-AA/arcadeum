import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export const GAME_SESSION_STATUS_VALUES = [
  'waiting',
  'active',
  'completed',
] as const;
export type GameSessionStatus = (typeof GAME_SESSION_STATUS_VALUES)[number];

@Schema({ timestamps: true })
export class GameSession extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  roomId: string;

  @Prop({ required: true })
  gameId: string;

  @Prop({ required: true })
  engine: string;

  @Prop({
    required: true,
    type: String,
    enum: GAME_SESSION_STATUS_VALUES,
    default: 'waiting',
  })
  status: GameSessionStatus;

  @Prop({ type: SchemaTypes.Mixed, required: true })
  state: Record<string, unknown>;

  @Prop({ type: SchemaTypes.Mixed })
  options?: Record<string, unknown>;

  createdAt: Date;
  updatedAt: Date;
}

export const GameSessionSchema = SchemaFactory.createForClass(GameSession);

GameSessionSchema.index({ status: 1, gameId: 1 });
GameSessionSchema.index({ status: 1, updatedAt: -1 });
// Auto-delete completed sessions after 90 days
GameSessionSchema.index(
  { updatedAt: 1 },
  {
    expireAfterSeconds: 90 * 24 * 60 * 60,
    partialFilterExpression: { status: 'completed' },
  },
);
