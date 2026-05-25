import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  buildCategoryMap,
  type NotificationCategoryMap,
} from '../notification-categories';

@Schema({ _id: false })
class NotificationCategoryPreferences {
  @Prop({ required: true, default: false })
  daily_reward_ready!: boolean;

  @Prop({ required: true, default: false })
  tournament_starting_soon!: boolean;

  @Prop({ required: true, default: false })
  tournament_registration_opened!: boolean;

  @Prop({ required: true, default: false })
  announcement_new!: boolean;
}
const NotificationCategoryPreferencesSchema = SchemaFactory.createForClass(
  NotificationCategoryPreferences,
);

@Schema({ timestamps: true, collection: 'notification_preferences' })
export class NotificationPreference {
  @Prop({ required: true, type: Types.ObjectId, unique: true })
  userId!: Types.ObjectId;

  @Prop({
    type: NotificationCategoryPreferencesSchema,
    required: true,
    default: () => buildCategoryMap(false),
  })
  categories!: NotificationCategoryMap<boolean>;
}

export type NotificationPreferenceDocument = NotificationPreference & Document;
export const NotificationPreferenceSchema = SchemaFactory.createForClass(
  NotificationPreference,
);
