import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class EconomySettingsAudit {
  @Prop({ required: true, index: true })
  key!: string;

  @Prop({ required: true, type: Number })
  fromValue!: number;

  @Prop({ required: true, type: Number })
  toValue!: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  adminUserId!: Types.ObjectId;
}

export type EconomySettingsAuditDocument = EconomySettingsAudit &
  Document & { createdAt?: Date };
export const EconomySettingsAuditSchema =
  SchemaFactory.createForClass(EconomySettingsAudit);
EconomySettingsAuditSchema.index({ key: 1, createdAt: -1 });
