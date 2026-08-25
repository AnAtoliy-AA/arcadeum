import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { PushSender } from './push-sender';
import { renderNotification, resolveLocale } from './i18n/render';
import type { SupportedLocale } from './i18n/notifications-messages';
import type { NotificationCategory } from './notification-categories';

export type DispatchParams = {
  userId: string;
  category: NotificationCategory;
  titleKey: string;
  bodyKey: string;
  i18nParams?: Record<string, unknown>;
  url: string;
  data?: Record<string, unknown>;
  locale?: SupportedLocale;
  /**
   * Skip the per-user category-preference query. Set by batch callers that
   * already filtered their audience (e.g. via listUserIdsWithCategoryEnabled)
   * so fan-out does one preference read total instead of one per recipient.
   */
  skipCategoryCheck?: boolean;
};

/** Max users processed concurrently during batch dispatch. */
const DISPATCH_CONCURRENCY = 10;

/**
 * Process items with bounded concurrency. Push providers rate-limit and
 * each dispatch performs several DB round-trips, so full parallelism would
 * stampede both; a small worker pool keeps cron windows comfortable.
 */
async function mapWithConcurrency<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let index = 0;
  const workers = Array.from(
    { length: Math.max(1, Math.min(limit, items.length)) },
    async () => {
      while (index < items.length) {
        const item = items[index++];
        await fn(item);
      }
    },
  );
  await Promise.all(workers);
}

@Injectable()
export class NotificationDispatcher {
  private readonly logger = new Logger(NotificationDispatcher.name);

  constructor(
    private readonly service: NotificationsService,
    private readonly gateway: NotificationsGateway,
    private readonly pushSender: PushSender,
  ) {}

  async dispatch(params: DispatchParams): Promise<void> {
    try {
      if (!params.skipCategoryCheck) {
        const enabled = await this.service.isCategoryEnabled(
          params.userId,
          params.category,
        );
        if (!enabled) return;
      }

      const row = await this.service.createInboxRow({
        userId: new Types.ObjectId(params.userId),
        category: params.category,
        titleKey: params.titleKey,
        bodyKey: params.bodyKey,
        i18nParams: params.i18nParams,
        url: params.url,
        data: params.data,
      });

      const notificationId = extractId(row);

      this.gateway.emitNew(params.userId, {
        id: notificationId,
        category: params.category,
        titleKey: params.titleKey,
        bodyKey: params.bodyKey,
        i18nParams: params.i18nParams ?? {},
        url: params.url,
        data: params.data ?? {},
        read: false,
        createdAt: new Date().toISOString(),
      });

      const unread = await this.service.unreadCount(params.userId);
      this.gateway.emitUnreadCount(params.userId, unread);

      if (!this.pushSender.isEnabled()) return;

      const subs = await this.service.getSubscriptions(params.userId);
      if (subs.length === 0) return;

      const locale = resolveLocale(params.locale);
      const title = renderNotification(
        params.titleKey,
        params.i18nParams ?? {},
        locale,
      );
      const body = renderNotification(
        params.bodyKey,
        params.i18nParams ?? {},
        locale,
      );

      await this.pushSender.sendAll(
        subs,
        { title, body, url: params.url, notificationId },
        (endpoint) => this.service.deleteSubscriptionByEndpoint(endpoint),
      );
    } catch (err) {
      this.logger.warn(
        `Dispatch failed for user ${params.userId} category ${params.category}: ${String(err)}`,
      );
    }
  }

  async dispatchMany(
    userIds: string[],
    params: Omit<DispatchParams, 'userId'>,
  ): Promise<void> {
    // Bounded concurrency instead of a serial loop: each dispatch performs
    // several awaits (inbox write, unread count, subscriptions, pushes), so
    // sequential fan-out stretches cron windows linearly with the audience.
    await mapWithConcurrency(userIds, DISPATCH_CONCURRENCY, (userId) =>
      this.dispatch({ ...params, userId }),
    );
  }
}

function extractId(row: unknown): string {
  if (!row || typeof row !== 'object') return '';
  const obj = row as { _id?: unknown; id?: unknown };
  const raw = obj._id ?? obj.id;
  if (raw instanceof Types.ObjectId) return raw.toHexString();
  if (typeof raw === 'string') return raw;
  return '';
}
