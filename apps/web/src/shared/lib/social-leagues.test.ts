import { describe, expect, it } from 'vitest';
import {
  formatLeagueTimeRemaining,
  getLeagueZone,
  getTierColorClass,
  getWeeklyLeagueTimeRemaining,
} from './social-leagues';

describe('social-leagues helpers', () => {
  it('calculates league zone based on participant rank', () => {
    expect(getLeagueZone(1, 30)).toBe('promotion');
    expect(getLeagueZone(5, 30)).toBe('promotion');
    expect(getLeagueZone(10, 30)).toBe('safe');
    expect(getLeagueZone(25, 30)).toBe('safe');
    expect(getLeagueZone(26, 30)).toBe('demotion');
    expect(getLeagueZone(30, 30)).toBe('demotion');
  });

  it('calculates and formats time remaining until weekly reset', () => {
    const fixedNow = new Date('2026-08-25T12:00:00Z').getTime(); // Tuesday
    const remaining = getWeeklyLeagueTimeRemaining(fixedNow);
    expect(remaining).toBeGreaterThan(0);

    const formatted = formatLeagueTimeRemaining(3600000 * 50);
    expect(formatted).toBe('2d 2h');

    const formattedShort = formatLeagueTimeRemaining(3600000 * 5 + 60000 * 30);
    expect(formattedShort).toBe('5h 30m');
  });

  it('returns valid color classes for league tiers', () => {
    expect(getTierColorClass('gold')).toContain('text-yellow-400');
    expect(getTierColorClass('diamond')).toContain('text-cyan-400');
  });
});
