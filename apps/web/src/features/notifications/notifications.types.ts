export const NOTIFICATION_CATEGORIES = [
  'daily_reward_ready',
  'tournament_starting_soon',
  'tournament_registration_opened',
  'announcement_new',
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export type NotificationPreferences = Record<NotificationCategory, boolean>;

export type NotificationDto = {
  id: string;
  category: NotificationCategory;
  titleKey: string;
  bodyKey: string;
  i18nParams: Record<string, unknown>;
  url: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: string;
};

export type CreateSubscriptionPayload = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
};

export type UnreadCountResponse = { count: number };

export type VapidPublicKeyResponse = { publicKey: string };

export type ListInboxOptions = {
  limit?: number;
  before?: Date;
};
