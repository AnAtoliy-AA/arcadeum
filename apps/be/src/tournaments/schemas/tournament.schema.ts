import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TournamentStatus =
  'scheduled' | 'registration_open' | 'live' | 'completed' | 'cancelled';
export type TournamentGameType = 'critical_v1' | 'sea_battle_v1' | 'chess_v1';
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
  'chess_v1',
] as const;
export const TOURNAMENT_LOCALES: readonly TournamentLocale[] = [
  'en',
  'ru',
  'es',
  'fr',
  'by',
] as const;

export type TournamentBracketFormat =
  'single_elimination' | 'round_robin' | 'arena' | 'swiss';

export const TOURNAMENT_BRACKET_FORMATS: readonly TournamentBracketFormat[] = [
  'single_elimination',
  'round_robin',
  'arena',
  'swiss',
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

@Schema({ _id: false })
class TournamentBracketMatch {
  @Prop({ required: true, type: Number, min: 1 })
  round!: number;

  @Prop({ required: true, type: Number, min: 0 })
  matchIndex!: number;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  playerA!: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  playerB!: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  winnerUserId!: Types.ObjectId | null;
}
const TournamentBracketMatchSchema = SchemaFactory.createForClass(
  TournamentBracketMatch,
);

@Schema({ _id: false })
class TournamentBracket {
  @Prop({ type: String, required: true, enum: TOURNAMENT_BRACKET_FORMATS })
  format!: TournamentBracketFormat;

  @Prop({ type: [[TournamentBracketMatchSchema]], default: [] })
  rounds!: TournamentBracketMatch[][];

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;
}
const TournamentBracketSchema = SchemaFactory.createForClass(TournamentBracket);

export type TournamentBracketMatchDocument = TournamentBracketMatch & Document;
export type TournamentBracketDocument = TournamentBracket & Document;

@Schema({ timestamps: true, collection: 'tournaments' })
export class Tournament {
  @Prop({
    type: String,
    required: true,
    enum: TOURNAMENT_STATUSES,
    default: 'scheduled',
  })
  status!: TournamentStatus;

  @Prop({ type: String, required: true, enum: TOURNAMENT_GAME_TYPES })
  gameType!: TournamentGameType;

  @Prop({ type: Date, required: true })
  scheduledAt!: Date;

  @Prop({ type: Date, default: null })
  registrationOpensAt!: Date | null;

  @Prop({ type: Date, default: null })
  registrationClosesAt!: Date | null;

  // ARC-740: set when the starting-soon notification cron has fired for
  // this tournament so we don't re-notify on the next tick.
  @Prop({ type: Date, default: null })
  notifiedStartingSoonAt!: Date | null;

  // ARC-740: set when the registration-opened notification has fanned
  // out to the audience.
  @Prop({ type: Date, default: null })
  notifiedRegistrationOpenAt!: Date | null;

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

  // ARC-926: embedded bracket. Optional — generated on demand while the
  // tournament is in `registration_open` or `live`.
  @Prop({ type: TournamentBracketSchema, default: null })
  bracket?: TournamentBracket | null;

  // Arena tournament: duration in minutes (15, 30, 60)
  @Prop({ type: Number, default: null, min: 1, max: 240 })
  arenaDurationMinutes?: number | null;

  // Swiss tournament: number of rounds (5-7)
  @Prop({ type: Number, default: null, min: 1, max: 20 })
  swissRoundCount?: number | null;

  // Chess tournament: time control per game
  @Prop({ type: String, default: null, maxlength: 50 })
  chessTimeControl?: string | null;

  // Live standings for arena tournaments (points per player)
  @Prop({
    type: [
      {
        _id: false,
        userId: { type: Types.ObjectId, ref: 'User', required: true },
        points: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        draws: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
      },
    ],
    default: [],
  })
  arenaStandings?: {
    userId: Types.ObjectId;
    points: number;
    streak: number;
    wins: number;
    draws: number;
    losses: number;
  }[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;
}

export type TournamentDocument = Tournament & Document;
export const TournamentSchema = SchemaFactory.createForClass(Tournament);

TournamentSchema.index({ status: 1, scheduledAt: 1 });
TournamentSchema.index({ scheduledAt: -1 });
TournamentSchema.index({ 'registrations.userId': 1, status: 1 });
