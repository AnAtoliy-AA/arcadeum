import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { USER_ROLES } from './user.schema';
import type { UserRole } from './user.schema';

@Schema({ timestamps: true })
export class UserAuth {
  @Prop({ type: Types.ObjectId, required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  emailEncrypted!: string;

  @Prop({ required: true, unique: true, index: true })
  emailBlindIndex!: string;

  @Prop({ type: String, default: null })
  encryptedDek?: string | null;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ type: String, enum: USER_ROLES, default: 'free' })
  role!: UserRole;

  @Prop({ type: Boolean, default: false })
  isBlocked!: boolean;

  @Prop({ type: Date, default: null })
  blockedAt?: Date | null;

  @Prop({ type: String, default: null })
  blockedReasonEncrypted?: string | null;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export type UserAuthDocument = UserAuth & Document;
export const UserAuthSchema = SchemaFactory.createForClass(UserAuth);
