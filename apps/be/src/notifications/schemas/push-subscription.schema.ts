import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class PushSubscriptionKeys {
  @Prop({ required: true })
  p256dh!: string;

  @Prop({ required: true })
  auth!: string;
}
const PushSubscriptionKeysSchema =
  SchemaFactory.createForClass(PushSubscriptionKeys);

@Schema({ timestamps: true, collection: 'push_subscriptions' })
export class PushSubscription {
  @Prop({ required: true, type: Types.ObjectId, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, unique: true })
  endpoint!: string;

  @Prop({ required: true, type: PushSubscriptionKeysSchema })
  keys!: PushSubscriptionKeys;

  @Prop()
  userAgent?: string;

  @Prop({ required: true, default: () => new Date() })
  lastUsedAt!: Date;
}

export type PushSubscriptionDocument = PushSubscription & Document;
export const PushSubscriptionSchema =
  SchemaFactory.createForClass(PushSubscription);

PushSubscriptionSchema.index({ userId: 1, endpoint: 1 });
