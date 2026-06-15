import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'user_daily_challenges', timestamps: true })
export class UserDailyChallenge extends Document {
  declare _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  date!: string;

  @Prop({
    type: [
      {
        challengeId: { type: String, required: true },
        progress: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
        claimed: { type: Boolean, default: false },
      },
    ],
    default: [],
  })
  challenges!: Array<{
    challengeId: string;
    progress: number;
    completed: boolean;
    claimed: boolean;
  }>;

  createdAt: Date;
  updatedAt: Date;
}

export type UserDailyChallengeDocument = UserDailyChallenge;
export const UserDailyChallengeSchema =
  SchemaFactory.createForClass(UserDailyChallenge);
UserDailyChallengeSchema.index({ userId: 1, date: 1 }, { unique: true });
