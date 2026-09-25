import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSpeedBadge,
  savePersonalBest,
  getPersonalBest,
  formatTimeSeconds,
  getDailyLeaderboard,
} from '../daily-leaderboard';

describe('daily-leaderboard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('assigns correct speed badges according to thresholds', () => {
    expect(getSpeedBadge(12000)).toBe('demon');
    expect(getSpeedBadge(25000)).toBe('tactician');
    expect(getSpeedBadge(45000)).toBe('thinker');
    expect(getSpeedBadge(90000)).toBe('steadfast');
  });

  it('formats time to seconds nicely', () => {
    expect(formatTimeSeconds(12400)).toBe('12.4s');
    expect(formatTimeSeconds(8000)).toBe('8.0s');
  });

  it('records and updates personal best times', () => {
    expect(getPersonalBest('daily-1')).toBeNull();

    const firstAttempt = savePersonalBest('daily-1', 25000);
    expect(firstAttempt.isNewPb).toBe(true);
    expect(firstAttempt.pb).toBe(25000);
    expect(getPersonalBest('daily-1')).toBe(25000);

    const slowerAttempt = savePersonalBest('daily-1', 30000);
    expect(slowerAttempt.isNewPb).toBe(false);
    expect(slowerAttempt.pb).toBe(25000);

    const fasterAttempt = savePersonalBest('daily-1', 18000);
    expect(fasterAttempt.isNewPb).toBe(true);
    expect(fasterAttempt.pb).toBe(18000);
    expect(getPersonalBest('daily-1')).toBe(18000);
  });

  it('generates ranked daily leaderboard including user time', () => {
    const lb = getDailyLeaderboard('2026-09-24', 9500);
    expect(lb.length).toBeGreaterThan(5);

    const userEntry = lb.find((e) => e.username === 'You');
    expect(userEntry).toBeDefined();
    expect(userEntry?.timeMs).toBe(9500);
    expect(userEntry?.rank).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < lb.length - 1; i++) {
      expect(lb[i]!.timeMs).toBeLessThanOrEqual(lb[i + 1]!.timeMs);
      expect(lb[i]!.rank).toBe(i + 1);
    }
  });
});
