import { renderNotification, resolveLocale } from './render';

describe('renderNotification', () => {
  it('renders a key with no params (en)', () => {
    expect(
      renderNotification('notifications.daily_reward_ready.title', {}, 'en'),
    ).toBe('Daily reward ready');
  });

  it('renders a key with params (en)', () => {
    expect(
      renderNotification(
        'notifications.tournament_starting_soon.title',
        { name: 'Spring Cup', minutes: 10 },
        'en',
      ),
    ).toBe('Spring Cup starts in 10 min');
  });

  it('uses Russian when locale=ru', () => {
    expect(
      renderNotification('notifications.daily_reward_ready.title', {}, 'ru'),
    ).toBe('Награда дня готова');
  });

  it('interpolates Spanish announcement_new params', () => {
    expect(
      renderNotification(
        'notifications.announcement_new.title',
        { title: 'Patch 1.15' },
        'es',
      ),
    ).toBe('Patch 1.15');
  });

  it('falls back to en when a locale is missing the key (defensive)', () => {
    expect(
      renderNotification(
        'notifications.daily_reward_ready.title',
        {},
        // @ts-expect-error: intentionally unsupported
        'xx',
      ),
    ).toBe('Daily reward ready');
  });

  it('returns the key itself when both locale and en lack it', () => {
    expect(
      renderNotification('notifications.unknown_category.title', {}, 'en'),
    ).toBe('notifications.unknown_category.title');
  });

  it('replaces missing params with empty string instead of leaving placeholder', () => {
    expect(
      renderNotification(
        'notifications.tournament_starting_soon.title',
        { name: 'Cup' },
        'en',
      ),
    ).toBe('Cup starts in  min');
  });
});

describe('resolveLocale', () => {
  it('passes through supported locales', () => {
    expect(resolveLocale('ru')).toBe('ru');
    expect(resolveLocale('by')).toBe('by');
  });

  it('falls back to en for unknown', () => {
    expect(resolveLocale('xx')).toBe('en');
    expect(resolveLocale(null)).toBe('en');
    expect(resolveLocale(undefined)).toBe('en');
    expect(resolveLocale(123)).toBe('en');
  });
});
