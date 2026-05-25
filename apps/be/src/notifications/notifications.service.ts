import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  buildCategoryMap,
  type NotificationCategory,
  type NotificationCategoryMap,
} from './notification-categories';
import {
  Notification,
  type NotificationDocument,
} from './schemas/notification.schema';
import {
  NotificationPreference,
  type NotificationPreferenceDocument,
} from './schemas/notification-preference.schema';
import {
  PushSubscription,
  type PushSubscriptionDocument,
} from './schemas/push-subscription.schema';

export type SubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
};

export type CreateInboxRowInput = {
  userId: Types.ObjectId;
  category: NotificationCategory;
  titleKey: string;
  bodyKey: string;
  i18nParams?: Record<string, unknown>;
  url: string;
  data?: Record<string, unknown>;
};

export type ListInboxOptions = {
  limit?: number;
  before?: Date;
};

const DEFAULT_INBOX_LIMIT = 20;
const MAX_INBOX_LIMIT = 50;

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(NotificationPreference.name)
    private readonly preferenceModel: Model<NotificationPreferenceDocument>,
    @InjectModel(PushSubscription.name)
    private readonly subscriptionModel: Model<PushSubscriptionDocument>,
  ) {}

  async getPreferences(
    userId: string,
  ): Promise<NotificationCategoryMap<boolean>> {
    const doc = await this.preferenceModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean()
      .exec();
    if (!doc) return buildCategoryMap(false);
    return { ...buildCategoryMap(false), ...doc.categories };
  }

  async updatePreferences(
    userId: string,
    partial: Partial<NotificationCategoryMap<boolean>>,
  ): Promise<NotificationCategoryMap<boolean>> {
    const current = await this.getPreferences(userId);
    const next: NotificationCategoryMap<boolean> = { ...current, ...partial };
    await this.preferenceModel
      .updateOne(
        { userId: new Types.ObjectId(userId) },
        { $set: { categories: next } },
        { upsert: true },
      )
      .exec();
    return next;
  }

  async isCategoryEnabled(
    userId: string,
    category: NotificationCategory,
  ): Promise<boolean> {
    const prefs = await this.getPreferences(userId);
    return prefs[category];
  }

  async listUserIdsWithCategoryEnabled(
    category: NotificationCategory,
  ): Promise<Types.ObjectId[]> {
    const docs = await this.preferenceModel
      .find({ [`categories.${category}`]: true }, { userId: 1 })
      .lean()
      .exec();
    return docs.map((d) => d.userId);
  }

  async addSubscription(
    userId: string,
    input: SubscriptionInput,
  ): Promise<void> {
    await this.subscriptionModel
      .updateOne(
        { endpoint: input.endpoint },
        {
          $set: {
            userId: new Types.ObjectId(userId),
            endpoint: input.endpoint,
            keys: input.keys,
            userAgent: input.userAgent,
            lastUsedAt: new Date(),
          },
        },
        { upsert: true },
      )
      .exec();
  }

  async removeSubscription(userId: string, endpoint: string): Promise<void> {
    await this.subscriptionModel
      .deleteOne({ userId: new Types.ObjectId(userId), endpoint })
      .exec();
  }

  async deleteSubscriptionByEndpoint(endpoint: string): Promise<void> {
    await this.subscriptionModel.deleteOne({ endpoint }).exec();
  }

  async getSubscriptions(
    userId: string,
  ): Promise<
    Array<{ endpoint: string; keys: { p256dh: string; auth: string } }>
  > {
    const docs = await this.subscriptionModel
      .find({ userId: new Types.ObjectId(userId) })
      .lean()
      .exec();
    return docs.map((d) => ({ endpoint: d.endpoint, keys: d.keys }));
  }

  async createInboxRow(
    input: CreateInboxRowInput,
  ): Promise<NotificationDocument> {
    const created = await this.notificationModel.create({
      userId: input.userId,
      category: input.category,
      titleKey: input.titleKey,
      bodyKey: input.bodyKey,
      i18nParams: input.i18nParams ?? {},
      url: input.url,
      data: input.data ?? {},
      read: false,
    });
    return created;
  }

  async listInbox(
    userId: string,
    options: ListInboxOptions = {},
  ): Promise<NotificationDocument[]> {
    const limit = Math.min(
      Math.max(1, options.limit ?? DEFAULT_INBOX_LIMIT),
      MAX_INBOX_LIMIT,
    );
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };
    if (options.before) {
      filter.createdAt = { $lt: options.before };
    }
    return this.notificationModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec() as unknown as Promise<NotificationDocument[]>;
  }

  async unreadCount(userId: string): Promise<number> {
    return this.notificationModel
      .countDocuments({ userId: new Types.ObjectId(userId), read: false })
      .exec();
  }

  async markRead(
    userId: string,
    options: { ids?: string[]; all?: boolean },
  ): Promise<void> {
    if (options.all) {
      await this.notificationModel
        .updateMany(
          { userId: new Types.ObjectId(userId), read: false },
          { $set: { read: true } },
        )
        .exec();
      return;
    }
    if (options.ids && options.ids.length > 0) {
      await this.notificationModel
        .updateMany(
          {
            userId: new Types.ObjectId(userId),
            _id: { $in: options.ids.map((id) => new Types.ObjectId(id)) },
          },
          { $set: { read: true } },
        )
        .exec();
    }
  }
}
