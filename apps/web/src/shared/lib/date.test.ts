import { describe, it, expect } from 'vitest';
import { formatSafeDate, formatSafeTime } from './date';

describe('date utils', () => {
  describe('formatSafeDate', () => {
    it('formats a valid date string', () => {
      const dateStr = '2023-10-27T10:00:00Z';
      // Output depends on environment locale, so we check if it's not the default value
      expect(formatSafeDate(dateStr, {}, 'N/A')).not.toBe('N/A');
    });

    it('returns default value for undefined/null', () => {
      expect(formatSafeDate(undefined, {}, 'N/A')).toBe('N/A');
      expect(formatSafeDate(null, {}, 'N/A')).toBe('N/A');
    });

    it('returns default value for invalid date', () => {
      expect(formatSafeDate('invalid-date', {}, 'N/A')).toBe('N/A');
    });
  });

  describe('formatSafeTime', () => {
    it('formats a valid time', () => {
      const dateStr = '2023-10-27T10:00:00Z';
      expect(formatSafeTime(dateStr, 'N/A')).not.toBe('N/A');
    });

    it('returns default value for invalid input', () => {
      expect(formatSafeTime('', 'N/A')).toBe('N/A');
      expect(formatSafeTime('invalid', 'N/A')).toBe('N/A');
    });
  });
});
