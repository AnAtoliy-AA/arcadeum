import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class GemPackage {
  @Prop({ required: true, maxlength: 100 })
  name!: string;

  @Prop({ required: true, type: Number, min: 1, max: 1_000_000 })
  gems!: number;

  @Prop({ type: Number, min: 0, max: 1_000_000, default: 0 })
  bonusGems!: number;

  /** Price in US cents (e.g. 999 = $9.99). Field name is priceUsd for historical reasons. */
  @Prop({ required: true, type: Number, min: 1, max: 100_000 })
  priceUsd!: number;

  @Prop({ type: Number, default: 0 })
  displayOrder!: number;

  @Prop({ type: Boolean, default: true })
  active!: boolean;
}

export type GemPackageDocument = GemPackage & Document;
export const GemPackageSchema = SchemaFactory.createForClass(GemPackage);
GemPackageSchema.index({ active: 1, displayOrder: 1 });
