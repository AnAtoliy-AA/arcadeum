import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { WalletService } from '../../wallet/wallet.service';

@Schema({ timestamps: true })
export class EconomySetting {
  @Prop({ required: true, unique: true, index: true })
  key!: string;

  @Prop({
    required: true,
    type: Number,
    min: 1,
    max: WalletService.MAX_TRANSACTION_AMOUNT,
  })
  value!: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export type EconomySettingDocument = EconomySetting &
  Document & { updatedAt?: Date };
export const EconomySettingSchema =
  SchemaFactory.createForClass(EconomySetting);
