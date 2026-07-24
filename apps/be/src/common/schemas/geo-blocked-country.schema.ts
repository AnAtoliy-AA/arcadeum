import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'geo_blocked_countries' })
export class GeoBlockedCountry {
  @Prop({ required: true, unique: true, maxlength: 2 })
  countryCode!: string;

  @Prop({ default: '' })
  reason?: string;

  @Prop({ type: Boolean, default: true })
  active!: boolean;
}

export type GeoBlockedCountryDocument = GeoBlockedCountry & Document;
export const GeoBlockedCountrySchema =
  SchemaFactory.createForClass(GeoBlockedCountry);
