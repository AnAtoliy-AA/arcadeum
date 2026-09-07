import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MagicLinkDocument = HydratedDocument<MagicLink>;

@Schema({ timestamps: true, collection: 'magic_link_tokens' })
export class MagicLink {
  @Prop({ required: true, index: true })
  email!: string;

  @Prop({ required: true, unique: true, index: true })
  token!: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ default: false })
  used!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  userId?: Types.ObjectId;
}

export const MagicLinkSchema = SchemaFactory.createForClass(MagicLink);

MagicLinkSchema.index({ email: 1, createdAt: -1 });
MagicLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
