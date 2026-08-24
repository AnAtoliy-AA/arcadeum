import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';
export const EVENT_STATUSES: readonly EventStatus[] = [
  'upcoming',
  'active',
  'completed',
  'cancelled',
] as const;

export type GameNightEventDocument = GameNightEvent & Document;

@Schema({ _id: false })
export class EventParticipant {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, maxlength: 100 })
  displayName!: string;

  @Prop({ type: String, default: null })
  avatarUrl!: string | null;

  @Prop({ default: 0 })
  gamesPlayed!: number;

  @Prop({ default: 0 })
  wins!: number;

  @Prop({ default: 0 })
  points!: number;

  @Prop({ type: Date, default: Date.now })
  registeredAt!: Date;
}
export const EventParticipantSchema =
  SchemaFactory.createForClass(EventParticipant);

@Schema({ timestamps: true, collection: 'game_night_events' })
export class GameNightEvent {
  @Prop({ required: true, index: true, maxlength: 120 })
  title!: string;

  @Prop({ default: '', maxlength: 2000 })
  description!: string;

  @Prop({ required: true, index: true })
  gameType!: string;

  @Prop({
    required: true,
    enum: EVENT_STATUSES,
    default: 'upcoming',
    index: true,
  })
  status!: EventStatus;

  @Prop({ type: Date, required: true, index: true })
  startTime!: Date;

  @Prop({ type: Date, required: true, index: true })
  endTime!: Date;

  @Prop({ type: String, default: null })
  prizeBadge!: string | null;

  @Prop({ type: [EventParticipantSchema], default: [] })
  participants!: EventParticipant[];

  @Prop({ default: 0 })
  activeGamesCount!: number;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  mvpUserId!: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  mvpDisplayName!: string | null;

  @Prop({ default: 0 })
  mvpPoints!: number;
}

export const GameNightEventSchema =
  SchemaFactory.createForClass(GameNightEvent);

GameNightEventSchema.index({ status: 1, startTime: 1 });
