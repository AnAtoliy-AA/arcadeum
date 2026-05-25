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
};

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
      const enabled = await this.service.isCategoryEnabled(
        params.userId,
        params.category,
      );
      if (!enabled) return;

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
    for (const userId of userIds) {
      await this.dispatch({ ...params, userId });
    }
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
