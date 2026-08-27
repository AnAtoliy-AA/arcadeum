import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClanDocument = Clan & Document;

export const CLAN_ROLES = ['leader', 'officer', 'member'] as const;
export type ClanRole = (typeof CLAN_ROLES)[number];

const CLAN_VISIBILITY = ['public', 'private'] as const;
export type ClanVisibility = (typeof CLAN_VISIBILITY)[number];

@Schema({ timestamps: true })
export class Clan {
  @Prop({ required: true, unique: true, index: true })
  name!: string;

  @Prop({ required: true, unique: true, index: true, maxlength: 6 })
  tag!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ type: String, default: null })
  avatarUrl!: string | null;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  leaderId!: Types.ObjectId;

  @Prop({ default: 0 })
  memberCount!: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  memberUserIds!: Types.ObjectId[];

  @Prop({
    type: String,
    enum: CLAN_VISIBILITY,
    default: 'public',
    required: true,
  })
  visibility!: ClanVisibility;

  @Prop({ type: String, default: null, sparse: true, unique: true })
  inviteCode!: string | null;

  @Prop({ default: 0 })
  totalWins!: number;

  @Prop({ default: 0 })
  totalGames!: number;
}

export const ClanSchema = SchemaFactory.createForClass(Clan);

ClanSchema.index({ name: 'text', tag: 'text' });
ClanSchema.index({ memberCount: -1 });
ClanSchema.index({ totalWins: -1 });
