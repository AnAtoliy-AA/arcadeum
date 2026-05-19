import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SupportChannelStatus =
  | 'pending'
  | 'sent'
  | 'failed'
  | 'unconfigured';

@Schema({ _id: false })
class SupportDeliveryStatus {
  @Prop({ required: true, default: 'pending' })
  discord!: SupportChannelStatus;

  @Prop({ required: true, default: 'pending' })
  email!: SupportChannelStatus;
}
const SupportDeliveryStatusSchema = SchemaFactory.createForClass(
  SupportDeliveryStatus,
);

@Schema({ _id: false })
class SupportDeliveryError {
  @Prop()
  discord?: string;

  @Prop()
  email?: string;
}
const SupportDeliveryErrorSchema =
  SchemaFactory.createForClass(SupportDeliveryError);

export type SupportContactDocument = SupportContact & Document;

@Schema({ timestamps: true, collection: 'support_contacts' })
export class SupportContact {
  @Prop({ required: true, maxlength: 120 })
  name!: string;

  @Prop({ required: true, maxlength: 200 })
  email!: string;

  @Prop({ required: true, maxlength: 200 })
  subject!: string;

  @Prop({ required: true, maxlength: 1200 })
  message!: string;

  @Prop({ maxlength: 64 })
  ip?: string;

  // sha256(ip|email|subject|message) — used to dedupe identical submissions
  // from the same IP within a short window.
  @Prop({ index: true })
  dedupeHash?: string;

  @Prop({ type: SupportDeliveryStatusSchema, required: true })
  status!: SupportDeliveryStatus;

  @Prop({ type: SupportDeliveryErrorSchema })
  error?: SupportDeliveryError;
}

export const SupportContactSchema =
  SchemaFactory.createForClass(SupportContact);

// Compound index to make the "duplicate in last hour" lookup cheap.
SupportContactSchema.index({ dedupeHash: 1, createdAt: -1 });
