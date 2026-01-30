import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PaymentNote {
  @Prop({ required: true, maxlength: 500 })
  note!: string;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true, maxlength: 8 })
  currency!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId?: Types.ObjectId;

  @Prop({ maxlength: 100 })
  displayName?: string;

  @Prop({ required: true, index: true })
  transactionId!: string;

  @Prop({ default: true })
  isPublic!: boolean;
}

export type PaymentNoteDocument = PaymentNote & Document;
export const PaymentNoteSchema = SchemaFactory.createForClass(PaymentNote);
