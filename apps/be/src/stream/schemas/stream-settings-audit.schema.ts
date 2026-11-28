import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class StreamAuditChange {
  @Prop({ type: String, required: true }) path!: string;
  @Prop({ type: Object }) from?: unknown;
  @Prop({ type: Object }) to?: unknown;
}

/** Who changed what and when. Never contains secrets (none are stored). */
@Schema({ timestamps: true, collection: 'stream_settings_audit' })
export class StreamSettingsAudit {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  adminUserId!: Types.ObjectId;

  @Prop({ required: true, type: Number })
  version!: number;

  @Prop({ type: String, required: true, enum: ['settings', 'command'] })
  kind!: 'settings' | 'command';

  @Prop({ type: [SchemaFactory.createForClass(StreamAuditChange)] })
  changes!: StreamAuditChange[];
}

export type StreamSettingsAuditDocument = StreamSettingsAudit &
  Document & { createdAt?: Date };
export const StreamSettingsAuditSchema =
  SchemaFactory.createForClass(StreamSettingsAudit);
StreamSettingsAuditSchema.index({ createdAt: -1 });
