export const NOTIFICATION_CATEGORIES = [
  'daily_reward_ready',
  'tournament_starting_soon',
  'tournament_registration_opened',
  'announcement_new',
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export function isNotificationCategory(
  value: unknown,
): value is NotificationCategory {
  return (
    typeof value === 'string' &&
    (NOTIFICATION_CATEGORIES as readonly string[]).includes(value)
  );
}

export type NotificationCategoryMap<T> = Record<NotificationCategory, T>;

export function buildCategoryMap<T>(value: T): NotificationCategoryMap<T> {
  const map = {} as NotificationCategoryMap<T>;
  for (const category of NOTIFICATION_CATEGORIES) {
    map[category] = value;
  }
  return map;
}
