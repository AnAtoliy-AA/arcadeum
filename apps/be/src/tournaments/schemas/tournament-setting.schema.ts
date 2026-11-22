import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'tournament_settings', timestamps: true })
export class TournamentSetting {
  @Prop({ required: true, unique: true })
  key!: string;

  @Prop({ type: Boolean, default: true })
  enabled!: boolean;

  @Prop({ type: Number, default: 500 })
  prizePoolCoins?: number;

  @Prop({ type: String, default: '500 Coins + Admiral Trophy' })
  prizeDescription?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  updatedBy?: Types.ObjectId | null;
}

export type TournamentSettingDocument = TournamentSetting & Document;
export const TournamentSettingSchema =
  SchemaFactory.createForClass(TournamentSetting);
