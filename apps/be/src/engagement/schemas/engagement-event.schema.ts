import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class EngagementEvent {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, index: true })
  eventType!: string;

  @Prop({ index: true })
  targetUserId?: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metadata!: Record<string, unknown>;

  @Prop({ default: false })
  isClaimed!: boolean;
}

export type EngagementEventDocument = EngagementEvent & Document;
export const EngagementEventSchema =
  SchemaFactory.createForClass(EngagementEvent);

EngagementEventSchema.index({ userId: 1, eventType: 1, createdAt: -1 });
