import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TournamentStatus =
  | 'scheduled'
  | 'registration_open'
  | 'live'
  | 'completed'
  | 'cancelled';
export type TournamentGameType = 'critical_v1' | 'sea_battle_v1';
export type TournamentLocale = 'en' | 'ru' | 'es' | 'fr' | 'by';

export const TOURNAMENT_STATUSES: readonly TournamentStatus[] = [
  'scheduled',
  'registration_open',
  'live',
  'completed',
  'cancelled',
] as const;
export const TOURNAMENT_GAME_TYPES: readonly TournamentGameType[] = [
  'critical_v1',
  'sea_battle_v1',
] as const;
export const TOURNAMENT_LOCALES: readonly TournamentLocale[] = [
  'en',
  'ru',
  'es',
  'fr',
  'by',
] as const;

@Schema({ _id: false })
class TournamentLocaleContent {
  @Prop({ required: true, maxlength: 120 })
  name!: string;

  @Prop({ maxlength: 1000 })
  description?: string;
}
const TournamentLocaleContentSchema = SchemaFactory.createForClass(
  TournamentLocaleContent,
);

@Schema({ _id: false })
class TournamentContent {
  @Prop({ type: TournamentLocaleContentSchema, required: true })
  en!: TournamentLocaleContent;

  @Prop({ type: TournamentLocaleContentSchema })
  ru?: TournamentLocaleContent;

  @Prop({ type: TournamentLocaleContentSchema })
  es?: TournamentLocaleContent;

  @Prop({ type: TournamentLocaleContentSchema })
  fr?: TournamentLocaleContent;

  @Prop({ type: TournamentLocaleContentSchema })
  by?: TournamentLocaleContent;
}
const TournamentContentSchema = SchemaFactory.createForClass(TournamentContent);

@Schema({ _id: false })
class TournamentRegistration {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, default: null, maxlength: 100 })
  displayName!: string | null;

  @Prop({ type: Date, default: Date.now })
  registeredAt!: Date;

  @Prop({ type: Boolean, default: false })
  waitlist!: boolean;
}
const TournamentRegistrationSchema = SchemaFactory.createForClass(
  TournamentRegistration,
);

@Schema({ timestamps: true, collection: 'tournaments' })
export class Tournament {
  @Prop({ required: true, enum: TOURNAMENT_STATUSES, default: 'scheduled' })
  status!: TournamentStatus;

  @Prop({ required: true, enum: TOURNAMENT_GAME_TYPES })
  gameType!: TournamentGameType;

  @Prop({ type: Date, required: true })
  scheduledAt!: Date;

  @Prop({ type: Date, default: null })
  registrationOpensAt!: Date | null;

  @Prop({ type: Date, default: null })
  registrationClosesAt!: Date | null;

  @Prop({ required: true, type: Number })
  maxPlayers!: number;

  @Prop({ type: String, default: null, maxlength: 500 })
  prizeDescription!: string | null;

  @Prop({ type: Number, default: 0, min: 0, max: 1_000_000 })
  entryFeeCoins!: number;

  @Prop({ type: Number, default: 0, min: 0, max: 1_000_000 })
  prizePoolCoins!: number;

  @Prop({ type: String, default: null })
  winnerUserId!: string | null;

  @Prop({ type: String, default: null, maxlength: 1000 })
  resultText!: string | null;

  @Prop({ type: TournamentContentSchema, required: true })
  content!: TournamentContent;

  @Prop({ type: [TournamentRegistrationSchema], default: [] })
  registrations!: TournamentRegistration[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;
}

export type TournamentDocument = Tournament & Document;
export const TournamentSchema = SchemaFactory.createForClass(Tournament);

TournamentSchema.index({ status: 1, scheduledAt: 1 });
TournamentSchema.index({ scheduledAt: -1 });
TournamentSchema.index({ 'registrations.userId': 1, status: 1 });
