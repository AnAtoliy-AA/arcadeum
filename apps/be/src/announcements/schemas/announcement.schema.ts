import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnnouncementSeverity = 'info' | 'warning' | 'critical';
export type AnnouncementAudience = 'all' | 'authenticated' | 'anonymous';
export type AnnouncementLocale = 'en' | 'ru' | 'es' | 'fr' | 'by';

export const ANNOUNCEMENT_SEVERITIES: readonly AnnouncementSeverity[] = [
  'info',
  'warning',
  'critical',
] as const;
export const ANNOUNCEMENT_AUDIENCES: readonly AnnouncementAudience[] = [
  'all',
  'authenticated',
  'anonymous',
] as const;
export const ANNOUNCEMENT_LOCALES: readonly AnnouncementLocale[] = [
  'en',
  'ru',
  'es',
  'fr',
  'by',
] as const;

@Schema({ _id: false })
class AnnouncementLocaleContent {
  @Prop({ required: true, maxlength: 120 })
  title!: string;

  @Prop({ maxlength: 500 })
  body?: string;

  @Prop({ maxlength: 60 })
  ctaLabel?: string;

  @Prop({ maxlength: 2048 })
  ctaHref?: string;
}
const AnnouncementLocaleContentSchema = SchemaFactory.createForClass(
  AnnouncementLocaleContent,
);

@Schema({ _id: false })
class AnnouncementContent {
  @Prop({ type: AnnouncementLocaleContentSchema, required: true })
  en!: AnnouncementLocaleContent;

  @Prop({ type: AnnouncementLocaleContentSchema })
  ru?: AnnouncementLocaleContent;

  @Prop({ type: AnnouncementLocaleContentSchema })
  es?: AnnouncementLocaleContent;

  @Prop({ type: AnnouncementLocaleContentSchema })
  fr?: AnnouncementLocaleContent;

  @Prop({ type: AnnouncementLocaleContentSchema })
  by?: AnnouncementLocaleContent;
}
const AnnouncementContentSchema =
  SchemaFactory.createForClass(AnnouncementContent);

@Schema({ timestamps: true, collection: 'announcements' })
export class Announcement {
  @Prop({ required: true, enum: ANNOUNCEMENT_SEVERITIES })
  severity!: AnnouncementSeverity;

  @Prop({ required: true, enum: ANNOUNCEMENT_AUDIENCES, default: 'all' })
  audience!: AnnouncementAudience;

  @Prop({ type: Date, default: null })
  startsAt!: Date | null;

  @Prop({ type: Date, default: null })
  endsAt!: Date | null;

  @Prop({ type: AnnouncementContentSchema, required: true })
  content!: AnnouncementContent;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;
}

export type AnnouncementDocument = Announcement & Document;
export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);

AnnouncementSchema.index({ startsAt: 1, endsAt: 1 });
AnnouncementSchema.index({ severity: -1, startsAt: -1 });
