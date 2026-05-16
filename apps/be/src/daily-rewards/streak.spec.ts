import {
  todayUtc,
  isYesterday,
  nextStreak,
  rewardKeyForStreak,
} from './streak';

describe('streak utilities', () => {
  describe('todayUtc', () => {
    it('formats a UTC date as YYYY-MM-DD', () => {
      const date = new Date('2026-05-11T12:34:56.000Z');
      expect(todayUtc(date)).toBe('2026-05-11');
    });

    it('returns the UTC day even when the local clock would round differently', () => {
      // 23:30 local time in negative offsets could still be the same UTC day —
      // we always use UTC accessors so this is deterministic.
      const date = new Date('2026-01-01T00:00:00.000Z');
      expect(todayUtc(date)).toBe('2026-01-01');
    });

    it('zero-pads month and day', () => {
      const date = new Date('2026-03-05T00:00:00.000Z');
      expect(todayUtc(date)).toBe('2026-03-05');
    });
  });

  describe('isYesterday', () => {
    it('returns true when prev is exactly one UTC day before today', () => {
      expect(isYesterday('2026-05-10', '2026-05-11')).toBe(true);
    });

    it('returns true across month boundaries', () => {
      expect(isYesterday('2026-04-30', '2026-05-01')).toBe(true);
    });

    it('returns true across year boundaries', () => {
      expect(isYesterday('2025-12-31', '2026-01-01')).toBe(true);
    });

    it('returns false when gap is larger than one day', () => {
      expect(isYesterday('2026-05-09', '2026-05-11')).toBe(false);
    });

    it('returns false when prev equals today', () => {
      expect(isYesterday('2026-05-11', '2026-05-11')).toBe(false);
    });

    it('returns false when prev is after today', () => {
      expect(isYesterday('2026-05-12', '2026-05-11')).toBe(false);
    });
  });

  describe('nextStreak', () => {
    it('returns 1 for the first claim (no prev)', () => {
      expect(nextStreak(0, null, '2026-05-11')).toBe(1);
    });

    it('increments when previous claim was yesterday', () => {
      expect(nextStreak(1, '2026-05-10', '2026-05-11')).toBe(2);
      expect(nextStreak(3, '2026-05-10', '2026-05-11')).toBe(4);
      expect(nextStreak(6, '2026-05-10', '2026-05-11')).toBe(7);
    });

    it('wraps from Day 7 back to Day 1 on the next consecutive day', () => {
      expect(nextStreak(7, '2026-05-10', '2026-05-11')).toBe(1);
    });

    it('resets to 1 when previous claim was earlier than yesterday', () => {
      expect(nextStreak(3, '2026-05-08', '2026-05-11')).toBe(1);
      expect(nextStreak(7, '2026-01-01', '2026-05-11')).toBe(1);
    });

    it('throws when previous claim was today (caller must guard before)', () => {
      expect(() => nextStreak(2, '2026-05-11', '2026-05-11')).toThrow();
    });
  });

  describe('rewardKeyForStreak', () => {
    it('maps 1..7 to daily_reward_day_N', () => {
      expect(rewardKeyForStreak(1)).toBe('daily_reward_day_1');
      expect(rewardKeyForStreak(2)).toBe('daily_reward_day_2');
      expect(rewardKeyForStreak(7)).toBe('daily_reward_day_7');
    });

    it('throws on out-of-range values', () => {
      expect(() => rewardKeyForStreak(0)).toThrow();
      expect(() => rewardKeyForStreak(8)).toThrow();
      expect(() => rewardKeyForStreak(-1)).toThrow();
      expect(() => rewardKeyForStreak(1.5)).toThrow();
    });
  });
});
