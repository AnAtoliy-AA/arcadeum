import {
  NOTIFICATION_CATEGORIES,
  isNotificationCategory,
  buildCategoryMap,
} from './notification-categories';

describe('NotificationCategory', () => {
  it('contains the four wave-1 categories in stable order', () => {
    expect(NOTIFICATION_CATEGORIES).toEqual([
      'daily_reward_ready',
      'tournament_starting_soon',
      'tournament_registration_opened',
      'announcement_new',
    ]);
  });

  it('isNotificationCategory accepts known values', () => {
    expect(isNotificationCategory('daily_reward_ready')).toBe(true);
    expect(isNotificationCategory('announcement_new')).toBe(true);
  });

  it('isNotificationCategory rejects unknown values', () => {
    expect(isNotificationCategory('made_up')).toBe(false);
    expect(isNotificationCategory(null)).toBe(false);
    expect(isNotificationCategory(undefined)).toBe(false);
    expect(isNotificationCategory(123)).toBe(false);
  });

  it('buildCategoryMap returns a map with every category set to the given value', () => {
    const allFalse = buildCategoryMap(false);
    for (const c of NOTIFICATION_CATEGORIES) {
      expect(allFalse[c]).toBe(false);
    }
    const allTrue = buildCategoryMap(true);
    expect(Object.values(allTrue).every((v) => v === true)).toBe(true);
  });
});
