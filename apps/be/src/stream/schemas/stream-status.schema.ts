import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/** Latest status pushed by the director (single document, key "default"). */
@Schema({ timestamps: false, collection: 'stream_status' })
export class StreamStatusDoc {
  @Prop({ type: String, required: true, unique: true, index: true })
  key!: string;

  @Prop({ required: true, type: Object })
  status!: Record<string, unknown>;

  @Prop({ type: Date, required: true })
  receivedAt!: Date;
}

export type StreamStatusDocument = StreamStatusDoc & Document;
export const StreamStatusSchema = SchemaFactory.createForClass(StreamStatusDoc);
