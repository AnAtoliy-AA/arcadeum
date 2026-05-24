import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import webpush, {
  type PushSubscription as WebPushSubscription,
} from 'web-push';

const MAX_PAYLOAD_BYTES = 3 * 1024;

export type PushPayload = {
  title: string;
  body: string;
  url: string;
  notificationId: string;
  icon?: string;
};

export type StoredSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

@Injectable()
export class PushSender {
  private readonly logger = new Logger(PushSender.name);
  private readonly enabled: boolean;
  private warnedDisabled = false;

  constructor(private readonly config: ConfigService) {
    const publicKey = config.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = config.get<string>('VAPID_PRIVATE_KEY');
    const subject = config.get<string>('VAPID_SUBJECT');

    this.enabled = Boolean(publicKey && privateKey && subject);

    if (this.enabled) {
      webpush.setVapidDetails(subject!, publicKey!, privateKey!);
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async sendOne(
    subscription: StoredSubscription,
    payload: PushPayload,
  ): Promise<void> {
    if (!this.enabled) {
      this.warnIfDisabled();
      return;
    }

    const body = truncatePayload(JSON.stringify(payload));
    try {
      await webpush.sendNotification(subscription as WebPushSubscription, body);
    } catch (err) {
      if (isSubscriptionGone(err)) {
        throw new SubscriptionGoneError(subscription.endpoint);
      }
      throw err;
    }
  }

  async sendAll(
    subscriptions: StoredSubscription[],
    payload: PushPayload,
    onGone: (endpoint: string) => Promise<void> | void,
  ): Promise<number> {
    if (!this.enabled) {
      this.warnIfDisabled();
      return 0;
    }

    let sent = 0;
    for (const sub of subscriptions) {
      try {
        await this.sendOne(sub, payload);
        sent += 1;
      } catch (err) {
        if (err instanceof SubscriptionGoneError) {
          try {
            await onGone(err.endpoint);
          } catch (cleanupErr) {
            this.logger.warn(
              `Failed to clean up gone subscription ${err.endpoint}: ${String(cleanupErr)}`,
            );
          }
        } else {
          this.logger.warn(
            `Push send failed for ${sub.endpoint}: ${String(err)}`,
          );
        }
      }
    }
    return sent;
  }

  private warnIfDisabled(): void {
    if (!this.warnedDisabled) {
      this.warnedDisabled = true;
      this.logger.warn(
        'VAPID keys not configured — web push is disabled. Inbox + socket events still work.',
      );
    }
  }
}

export class SubscriptionGoneError extends Error {
  constructor(public readonly endpoint: string) {
    super(`Subscription gone: ${endpoint}`);
    this.name = 'SubscriptionGoneError';
  }
}

function isSubscriptionGone(err: unknown): boolean {
  if (
    typeof err === 'object' &&
    err !== null &&
    'statusCode' in err &&
    typeof (err as { statusCode: unknown }).statusCode === 'number'
  ) {
    const status = (err as { statusCode: number }).statusCode;
    return status === 404 || status === 410;
  }
  return false;
}

function truncatePayload(body: string): string {
  if (Buffer.byteLength(body, 'utf8') <= MAX_PAYLOAD_BYTES) return body;
  return body.slice(0, MAX_PAYLOAD_BYTES);
}
