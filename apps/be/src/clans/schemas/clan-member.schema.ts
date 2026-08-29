import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CLAN_ROLES } from './clan.schema';

export type ClanMemberDocument = ClanMember & Document;

@Schema({ timestamps: true })
export class ClanMember {
  @Prop({ type: Types.ObjectId, ref: 'Clan', required: true })
  clanId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: CLAN_ROLES,
    default: 'member',
    required: true,
  })
  role!: string;

  @Prop({ default: 0 })
  wins!: number;

  @Prop({ default: 0 })
  gamesPlayed!: number;
}

export const ClanMemberSchema = SchemaFactory.createForClass(ClanMember);

ClanMemberSchema.index({ clanId: 1, userId: 1 }, { unique: true });
ClanMemberSchema.index({ userId: 1 });
