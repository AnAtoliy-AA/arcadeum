import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export const ACTIVITY_FEED_TYPE_VALUES = [
  'game_completed',
  'achievement_unlocked',
] as const;
export type ActivityFeedType = (typeof ACTIVITY_FEED_TYPE_VALUES)[number];

@Schema({ collection: 'activity_feed', timestamps: true })
export class ActivityFeedItem extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, type: String, enum: ACTIVITY_FEED_TYPE_VALUES })
  type!: ActivityFeedType;

  @Prop({ required: true })
  userId!: string;

  @Prop({ default: '' })
  displayName!: string;

  @Prop({ default: '' })
  gameId!: string;

  @Prop({ default: '' })
  gameName!: string;

  @Prop({ default: '' })
  detail!: string;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;

  createdAt: Date;
  updatedAt: Date;
}

export type ActivityFeedItemDocument = ActivityFeedItem;
export const ActivityFeedItemSchema =
  SchemaFactory.createForClass(ActivityFeedItem);
ActivityFeedItemSchema.index({ createdAt: -1 });
// Auto-delete activity feed items after 7 days
ActivityFeedItemSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60 },
);
