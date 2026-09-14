import { weekKeyForDate, weekIndexForDate } from './weekly-league.service';

describe('weekly-league utilities', () => {
  describe('weekKeyForDate', () => {
    it('returns ISO week key for a known date', () => {
      // 2026-09-11 is in week 37
      const date = new Date('2026-09-11T12:00:00.000Z');
      expect(weekKeyForDate(date)).toBe('2026-W37');
    });

    it('returns correct week for year boundary', () => {
      // 2026-01-01 is a Thursday — week 1
      const date = new Date('2026-01-01T12:00:00.000Z');
      expect(weekKeyForDate(date)).toBe('2026-W01');
    });

    it('returns correct week for Sunday', () => {
      // 2026-09-13 is a Sunday
      const date = new Date('2026-09-13T12:00:00.000Z');
      expect(weekKeyForDate(date)).toBe('2026-W37');
    });
  });

  describe('weekIndexForDate', () => {
    it('returns numeric index matching the week key', () => {
      const date = new Date('2026-09-11T12:00:00.000Z');
      expect(weekIndexForDate(date)).toBe(202637);
    });
  });
});
