import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Per-user state for the daily-claim streak. One document per user; absence
 * of a document means the user has never claimed a daily reward.
 *
 * Fields:
 *  - userId: owning user (unique index — at most one row per user).
 *  - lastClaimedDay: YYYY-MM-DD in UTC; identifies the day the user last
 *    successfully claimed. Used to detect "already claimed today" and to
 *    decide whether the previous claim was yesterday (streak continues) or
 *    earlier (streak resets).
 *  - currentStreak: 0..7 representing the day in the cycle the user just
 *    claimed. After Day 7 the next claim wraps to 1.
 */
@Schema({ collection: 'user_daily_rewards', timestamps: true })
export class UserDailyReward extends Document {
  declare _id: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  lastClaimedDay: string;

  @Prop({ type: Number, required: true, min: 0, max: 7 })
  currentStreak: number;

  createdAt: Date;
  updatedAt: Date;
}

export type UserDailyRewardDocument = UserDailyReward;

export const UserDailyRewardSchema =
  SchemaFactory.createForClass(UserDailyReward);
