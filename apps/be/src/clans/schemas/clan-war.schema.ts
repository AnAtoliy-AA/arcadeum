import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClanWarDocument = ClanWar & Document;

export const CLAN_WAR_STATUSES = [
  'pending',
  'active',
  'completed',
  'declined',
] as const;
export type ClanWarStatus = (typeof CLAN_WAR_STATUSES)[number];

export interface ClanWarLogEntry {
  id: string;
  playerClanId: string;
  playerName: string;
  opponentClanId: string;
  opponentName: string;
  gameId: string;
  winnerClanId: string;
  timestamp: string;
}

@Schema({ timestamps: true })
export class ClanWar {
  @Prop({ type: Types.ObjectId, ref: 'Clan', required: true, index: true })
  initiatorClanId!: Types.ObjectId;

  @Prop({ required: true })
  initiatorClanName!: string;

  @Prop({ required: true })
  initiatorClanTag!: string;

  @Prop({ required: true, default: 0 })
  initiatorScore!: number;

  @Prop({ type: Types.ObjectId, ref: 'Clan', required: true, index: true })
  targetClanId!: Types.ObjectId;

  @Prop({ required: true })
  targetClanName!: string;

  @Prop({ required: true })
  targetClanTag!: string;

  @Prop({ required: true, default: 0 })
  targetClanScore!: number;

  @Prop({ required: true, default: 5 })
  targetScore!: number;

  @Prop({ required: true, default: 'all', index: true })
  gameId!: string;

  @Prop({
    type: String,
    enum: CLAN_WAR_STATUSES,
    default: 'active',
    index: true,
  })
  status!: ClanWarStatus;

  @Prop({ type: Types.ObjectId, ref: 'Clan', default: null })
  winnerClanId!: Types.ObjectId | null;

  @Prop({
    required: true,
    default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  })
  expiresAt!: Date;

  @Prop({ type: [Object], default: [] })
  matchLogs!: ClanWarLogEntry[];
}

export const ClanWarSchema = SchemaFactory.createForClass(ClanWar);

ClanWarSchema.index({ initiatorClanId: 1, targetClanId: 1 });
ClanWarSchema.index({ status: 1, createdAt: -1 });
