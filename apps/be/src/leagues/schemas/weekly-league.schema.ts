import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export const LEAGUE_TIERS = [
  'bronze',
  'silver',
  'gold',
  'diamond',
  'master',
] as const;
export type LeagueTier = (typeof LEAGUE_TIERS)[number];

@Schema({ _id: false })
export class LeagueParticipant {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId!: Types.ObjectId;

  @Prop({ type: String, default: '' })
  username!: string;

  @Prop({ type: Number, default: 0 })
  trophies!: number;

  @Prop({ type: Number, default: 0 })
  rank!: number;

  @Prop({ type: Number, default: 0 })
  prevRank!: number;
}

export const LeagueParticipantSchema =
  SchemaFactory.createForClass(LeagueParticipant);

@Schema({
  timestamps: true,
  collection: 'weekly_leagues',
})
export class WeeklyLeague extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, type: String, enum: LEAGUE_TIERS })
  tier!: LeagueTier;

  /** ISO week number (e.g. "2026-W37") — identifies the weekly cycle. */
  @Prop({ required: true, type: String })
  weekKey!: string;

  /** Sequential index for efficient querying (e.g. 2026037). */
  @Prop({ required: true, type: Number })
  weekIndex!: number;

  @Prop({ type: [LeagueParticipantSchema], default: [] })
  participants!: LeagueParticipant[];

  /** Number of participants that promote (top N move up a tier). */
  @Prop({ type: Number, default: 5 })
  promoteCount!: number;

  /** Number of participants that demote (bottom N move down a tier). */
  @Prop({ type: Number, default: 5 })
  demoteCount!: number;

  /** True after the weekly rollover has processed this league. */
  @Prop({ type: Boolean, default: false })
  finalized!: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export type WeeklyLeagueDocument = WeeklyLeague;
export const WeeklyLeagueSchema = SchemaFactory.createForClass(WeeklyLeague);

WeeklyLeagueSchema.index({ tier: 1, weekIndex: -1 });
WeeklyLeagueSchema.index({ weekKey: 1, tier: 1 });
