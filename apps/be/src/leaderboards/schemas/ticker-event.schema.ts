import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class TickerEvent {
  @Prop({ required: true })
  who!: string;

  @Prop({ required: true })
  what!: string;

  @Prop({ type: String })
  color?: string;

  @Prop({ type: Date, default: Date.now, index: true })
  occurredAt!: Date;

  // Optional 30-min visibility window so the rotating row doesn't show stale events.
  @Prop({ type: Date, index: true })
  expiresAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export type TickerEventDocument = TickerEvent & Document;
export const TickerEventSchema = SchemaFactory.createForClass(TickerEvent);
