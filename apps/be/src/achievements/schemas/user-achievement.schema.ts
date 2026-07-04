import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'user_achievements', timestamps: true })
export class UserAchievement extends Document {
  declare _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({
    type: [
      {
        achievementId: { type: String, required: true },
        unlockedAt: { type: Date },
        claimed: { type: Boolean, default: false },
      },
    ],
    default: [],
  })
  achievements!: Array<{
    achievementId: string;
    unlockedAt?: Date;
    claimed: boolean;
  }>;

  @Prop({ type: Number, default: 0 })
  totalXpEarned!: number;

  createdAt: Date;
  updatedAt: Date;
}

export type UserAchievementDocument = UserAchievement;
export const UserAchievementSchema =
  SchemaFactory.createForClass(UserAchievement);
UserAchievementSchema.index({ userId: 1 }, { unique: true });
