import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/** Single document (key "default") holding the current stream settings. */
@Schema({ timestamps: true, collection: 'stream_settings' })
export class StreamSettingsDoc {
  @Prop({ type: String, required: true, unique: true, index: true })
  key!: string;

  @Prop({ required: true, type: Number, default: 0 })
  version!: number;

  @Prop({ required: true, type: Object })
  config!: Record<string, unknown>;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export type StreamSettingsDocument = StreamSettingsDoc &
  Document & { updatedAt?: Date };
export const StreamSettingsSchema =
  SchemaFactory.createForClass(StreamSettingsDoc);
