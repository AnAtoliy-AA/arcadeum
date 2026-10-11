import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { USER_ROLES } from './user.schema';
import type { UserRole } from './user.schema';

@Schema({ timestamps: true })
export class UserProfile {
  @Prop({ type: Types.ObjectId, required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  username!: string;

  @Prop({ required: true, unique: true, index: true })
  usernameNormalized!: string;

  @Prop({ trim: true })
  displayName?: string;

  @Prop({ type: String, enum: USER_ROLES, default: 'free' })
  role!: UserRole;

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

  @Prop({ type: String, default: null })
  equippedGameSkinId?: string | null;

  @Prop({ type: String, default: null })
  equippedBackgroundId?: string | null;

  @Prop({ type: String, default: null })
  countryCode?: string | null;
}

export type UserProfileDocument = UserProfile & Document;
export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);

UserProfileSchema.pre<UserProfileDocument>(
  'save',
  function setNormalizedUsername(next) {
    if (this.isModified('username') && this.username) {
      this.usernameNormalized = this.username.toLowerCase();
    }
    next();
  },
);
