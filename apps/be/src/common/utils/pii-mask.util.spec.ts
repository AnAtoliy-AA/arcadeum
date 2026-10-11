import { maskEmail, maskSensitiveText } from './pii-mask.util';

describe('pii-mask.util', () => {
  describe('maskEmail', () => {
    it('masks standard email local parts', () => {
      expect(maskEmail('alice@example.com')).toBe('a***e@example.com');
      expect(maskEmail('john.doe@company.org')).toBe('j***e@company.org');
    });

    it('masks short local parts', () => {
      expect(maskEmail('a@x.com')).toBe('a***@x.com');
      expect(maskEmail('ab@x.com')).toBe('a***@x.com');
      expect(maskEmail('abc@x.com')).toBe('a***c@x.com');
    });

    it('returns asterisks for malformed or empty email', () => {
      expect(maskEmail('')).toBe('***');
      expect(maskEmail('notanemail')).toBe('***');
      expect(maskEmail('@nodomain')).toBe('***');
      expect(maskEmail('nolocal@')).toBe('***');
    });
  });

  describe('maskSensitiveText', () => {
    it('masks strings preserving leading and trailing characters', () => {
      expect(maskSensitiveText('1234567890')).toBe('12***90');
      expect(maskSensitiveText('secrettoken123', 3, 3)).toBe('sec***123');
    });

    it('returns asterisks if string is too short or empty', () => {
      expect(maskSensitiveText('1234')).toBe('***');
      expect(maskSensitiveText('')).toBe('***');
    });
  });
});
