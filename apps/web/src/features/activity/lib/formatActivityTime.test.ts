import { describe, expect, it } from 'vitest';
import {
  formatAbsoluteTime,
  formatRatingDelta,
  formatRelativeTime,
  formatScore,
  toIntlLocale,
} from './formatActivityTime';

const NOW = Date.UTC(2026, 10, 28, 12, 0, 0);
const ago = (sec: number) => new Date(NOW - sec * 1000).toISOString();

describe('formatRelativeTime', () => {
  it('says now for under a minute', () => {
    expect(formatRelativeTime(ago(20), 'en', NOW)).toBe('now');
  });

  it('uses minutes, hours and days', () => {
    expect(formatRelativeTime(ago(5 * 60), 'en', NOW)).toMatch(/5 min/);
    expect(formatRelativeTime(ago(3 * 3600), 'en', NOW)).toMatch(/3 hr/);
    expect(formatRelativeTime(ago(2 * 86_400), 'en', NOW)).toMatch(/2 days/);
  });

  it('localizes (Russian)', () => {
    expect(formatRelativeTime(ago(5 * 60), 'ru', NOW)).toContain('5');
    expect(formatRelativeTime(ago(5 * 60), 'ru', NOW)).not.toContain('ago');
  });

  it('falls back to a short date after a week', () => {
    expect(formatRelativeTime(ago(10 * 86_400), 'en', NOW)).toBe('Nov 18');
  });

  it('returns an empty string for invalid timestamps', () => {
    expect(formatRelativeTime('nope', 'en', NOW)).toBe('');
    expect(formatAbsoluteTime('nope', 'en')).toBe('');
  });
});

describe('formatters', () => {
  it('maps the by locale to Belarusian', () => {
    expect(toIntlLocale('by')).toBe('be');
    expect(toIntlLocale(undefined)).toBe('en');
  });

  it('formats absolute time with date and time', () => {
    expect(formatAbsoluteTime(ago(0), 'en')).toMatch(/2026/);
  });

  it('signs rating deltas', () => {
    expect(formatRatingDelta(12)).toBe('+12');
    expect(formatRatingDelta(-8)).toBe('−8');
    expect(formatRatingDelta(0)).toBe('±0');
  });

  it('formats scores actor first', () => {
    expect(formatScore({ actor: 3, opponents: [1] })).toBe('3 - 1');
    expect(formatScore({ actor: 120, opponents: [85, 40] })).toBe(
      '120 - 85 - 40',
    );
  });
});
