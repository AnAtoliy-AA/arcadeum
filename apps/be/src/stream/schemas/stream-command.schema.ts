import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export const COMMAND_STATUSES = [
  'pending',
  'done',
  'failed',
  'expired',
] as const;
export type CommandStatus = (typeof COMMAND_STATUSES)[number];

@Schema({ timestamps: true, collection: 'stream_commands' })
export class StreamCommand {
  @Prop({
    type: String,
    required: true,
    enum: ['start', 'stop', 'skip', 'restart_browser'],
  })
  type!: string;

  @Prop({ type: Boolean, default: false })
  graceful!: boolean;

  @Prop({
    type: String,
    required: true,
    enum: COMMAND_STATUSES,
    default: 'pending',
  })
  status!: CommandStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requestedBy!: Types.ObjectId;

  @Prop({ type: Date }) ackedAt?: Date;
  @Prop({ type: String }) message?: string;
}

export type StreamCommandDocument = StreamCommand &
  Document & { createdAt?: Date };
export const StreamCommandSchema = SchemaFactory.createForClass(StreamCommand);
StreamCommandSchema.index({ status: 1, createdAt: 1 });
// Keep a week of history, then let Mongo clean up.
StreamCommandSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 7 * 24 * 3600 },
);
