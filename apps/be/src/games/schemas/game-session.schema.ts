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
  state: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const GameSessionSchema = SchemaFactory.createForClass(GameSession);
