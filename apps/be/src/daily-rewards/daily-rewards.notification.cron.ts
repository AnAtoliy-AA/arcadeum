import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model, Types } from 'mongoose';
import { NotificationDispatcher } from '../notifications/notifications.dispatcher';
import { NotificationsService } from '../notifications/notifications.service';
import {
  UserDailyReward,
  type UserDailyRewardDocument,
} from './schemas/user-daily-reward.schema';

const ONE_HOUR_MS = 60 * 60 * 1000;

@Injectable()
export class DailyRewardsNotificationCron {
  private readonly logger = new Logger(DailyRewardsNotificationCron.name);

  constructor(
    @InjectModel(UserDailyReward.name)
    private readonly model: Model<UserDailyRewardDocument>,
    private readonly dispatcher: NotificationDispatcher,
    private readonly notifications: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async run(): Promise<void> {
    try {
      const optedIn =
        await this.notifications.listUserIdsWithCategoryEnabled(
          'daily_reward_ready',
        );
      if (optedIn.length === 0) return;
      await this.notifyDueUsers(optedIn);
    } catch (err) {
      this.logger.warn(`daily-rewards notify cron failed: ${String(err)}`);
    }
  }

  // Exposed for tests — takes the opted-in user list and notifies those
  // whose last claim is between 23 and 25 hours ago.
  async notifyDueUsers(optedInUserIds: Types.ObjectId[]): Promise<number> {
    const now = Date.now();
    const minSinceClaim = now - 25 * ONE_HOUR_MS;
    const maxSinceClaim = now - 23 * ONE_HOUR_MS;

    const docs = await this.model
      .find({
        userId: { $in: optedInUserIds },
        updatedAt: {
          $gte: new Date(minSinceClaim),
          $lte: new Date(maxSinceClaim),
        },
      })
      .lean()
      .exec();

    let sent = 0;
    await this.dispatcher.dispatchMany(
      docs.map((doc) => doc.userId.toHexString()),
      {
        category: 'daily_reward_ready',
        titleKey: 'notifications.daily_reward_ready.title',
        bodyKey: 'notifications.daily_reward_ready.body',
        url: '/daily-rewards',
        // The cron already filtered to opted-in users — skip the per-user
        // preference query inside dispatch().
        skipCategoryCheck: true,
      },
    );
    sent = docs.length;
    return sent;
  }
}
