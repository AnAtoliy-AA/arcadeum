import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/** Available user roles */
export const USER_ROLES = [
  'free',
  'premium',
  'vip',
  'supporter',
  'moderator',
  'tester',
  'developer',
  'admin',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true })
  username!: string;

  @Prop({ required: true, unique: true })
  usernameNormalized!: string;

  @Prop({ trim: true })
  displayName?: string;

  @Prop({ type: String, enum: USER_ROLES, default: 'free' })
  role!: UserRole;

  @Prop({ type: [String], default: [] })
  blockedUsers!: string[];

  @Prop({ unique: true, sparse: true, trim: true, index: true })
  referralCode?: string;

  @Prop({ type: String, default: null })
  referredBy?: string | null;

  @Prop({ type: Number, default: 0, min: 0 })
  coins!: number;

  @Prop({ type: Number, default: 0, min: 0 })
  gems!: number;

  @Prop({ type: String, default: null })
  equippedAvatarId?: string | null;

  @Prop({ type: String, default: null })
  equippedBadgeId?: string | null;

  @Prop({ type: String, default: null })
  equippedNameColorId?: string | null;

  @Prop({ type: String, default: null })
  equippedBannerId?: string | null;

  @Prop({ type: String, default: null })
  equippedAuraId?: string | null;

  @Prop({ type: String, default: null })
  equippedFrameId?: string | null;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('save', function setNormalizedUsername(next) {
  if (this.isModified('username') && this.username) {
    this.usernameNormalized = this.username.toLowerCase();
  }
  next();
});
