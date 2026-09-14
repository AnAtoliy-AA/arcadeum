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

/**
 * Returns the current hour (0-23) in the given IANA timezone.
 * Returns null if the timezone is invalid.
 */
function hourInTimezone(timezone: string): number | null {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: timezone,
    });
    const hour = parseInt(formatter.format(new Date()), 10);
    return Number.isFinite(hour) ? hour : null;
  } catch {
    return null;
  }
}

/**
 * Checks if the user should be notified now based on their timezone.
 * Users are notified when it's between 8 and 10 AM in their local time.
 * Users without a timezone are notified at the default UTC schedule.
 */
function shouldNotifyNow(timezone: string | null): boolean {
  if (!timezone) return true; // UTC default — always notify
  const hour = hourInTimezone(timezone);
  if (hour === null) return true; // invalid tz — fall back to always notify
  return hour >= 8 && hour <= 10;
}

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
  // whose last claim is between 23 and 25 hours ago AND whose timezone
  // allows notification at this hour.
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

    if (docs.length === 0) return 0;

    // Fetch timezones for the due users
    const userIds = docs.map((d) => d.userId);
    const timezones = await this.notifications.getTimezones(userIds);

    // Filter to users whose local hour is appropriate
    const filteredUserIds = docs
      .filter((doc) => {
        const tz = timezones.get(doc.userId.toHexString()) ?? null;
        return shouldNotifyNow(tz);
      })
      .map((doc) => doc.userId.toHexString());

    if (filteredUserIds.length === 0) return 0;

    await this.dispatcher.dispatchMany(filteredUserIds, {
      category: 'daily_reward_ready',
      titleKey: 'notifications.daily_reward_ready.title',
      bodyKey: 'notifications.daily_reward_ready.body',
      url: '/daily-rewards',
      // The cron already filtered to opted-in users — skip the per-user
      // preference query inside dispatch().
      skipCategoryCheck: true,
    });
    return filteredUserIds.length;
  }
}
