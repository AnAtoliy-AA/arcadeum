import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserWallet {
  @Prop({ type: Types.ObjectId, required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Number, default: 0, min: 0 })
  coins!: number;

  @Prop({ type: Number, default: 0, min: 0 })
  gems!: number;

  @Prop({ type: Number, default: 0, min: 0 })
  arcadeum!: number;

  @Prop({ type: Number, default: 0, min: 0 })
  xp!: number;

  @Prop({ type: Number, default: 0, min: 0 })
  prestige!: number;

  @Prop({ type: Number, default: 0, min: 0 })
  claimedLevel?: number;
}

export type UserWalletDocument = UserWallet & Document;
export const UserWalletSchema = SchemaFactory.createForClass(UserWallet);
