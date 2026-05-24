import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  NOTIFICATION_CATEGORIES,
  type NotificationCategory,
} from '../notification-categories';

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  @Prop({ required: true, type: Types.ObjectId, index: true })
  userId!: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: NOTIFICATION_CATEGORIES as readonly string[],
  })
  category!: NotificationCategory;

  @Prop({ required: true })
  titleKey!: string;

  @Prop({ required: true })
  bodyKey!: string;

  @Prop({ type: Object, default: {} })
  i18nParams!: Record<string, unknown>;

  @Prop({ required: true })
  url!: string;

  @Prop({ type: Object, default: {} })
  data!: Record<string, unknown>;

  @Prop({ required: true, default: false })
  read!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export type NotificationDocument = Notification & Document;
export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: THIRTY_DAYS_SECONDS },
);
