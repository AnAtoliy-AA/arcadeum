import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class XpSettings {
  @Prop({ required: true, unique: true, index: true, trim: true })
  scope!: string;

  @Prop({ type: Number, min: 0 })
  winXp!: number;

  @Prop({ type: Number, min: 0 })
  lossXp!: number;

  @Prop({ type: Number, min: 0 })
  drawXp!: number;

  @Prop({ type: Number, min: 0, max: 10 })
  soloCoefficient!: number;

  @Prop({ type: Number, min: 0, max: 10 })
  botCoefficient!: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export type XpSettingsDocument = XpSettings & Document;
export const XpSettingsSchema = SchemaFactory.createForClass(XpSettings);
