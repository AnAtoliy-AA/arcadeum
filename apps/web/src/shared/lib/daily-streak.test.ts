import { describe, it, expect, beforeEach } from 'vitest';
import { DailyStreakManager } from './daily-streak';

describe('DailyStreakManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts streak at 1 on first daily completion', () => {
    const state = DailyStreakManager.recordCompletion('2026-08-29');
    expect(state.currentStreak).toBe(1);
    expect(state.longestStreak).toBe(1);
    expect(state.lastCompletedDateString).toBe('2026-08-29');
  });

  it('increments streak when completing consecutively', () => {
    DailyStreakManager.recordCompletion(
      DailyStreakManager.getYesterdayDateString(),
    );
    const state = DailyStreakManager.recordCompletion(
      DailyStreakManager.getTodayDateString(),
    );
    expect(state.currentStreak).toBe(2);
    expect(state.longestStreak).toBe(2);
  });

  it('calculates XP multiplier accurately', () => {
    expect(DailyStreakManager.calculateXpMultiplier(0)).toBe(1.0);
    expect(DailyStreakManager.calculateXpMultiplier(5)).toBe(1.5);
    expect(DailyStreakManager.calculateXpMultiplier(20)).toBe(2.0);
  });

  it('formats viral share card string', () => {
    const card = DailyStreakManager.formatShareCard('Chess Tactics', 42, 3, 5);
    expect(card).toContain('Arcadeum Daily Challenge #42');
    expect(card).toContain('Chess Tactics solved in 3 moves!');
    expect(card).toContain('5-day streak active!');
  });
});
