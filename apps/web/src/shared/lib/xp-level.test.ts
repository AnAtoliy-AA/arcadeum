import { describe, expect, it } from 'vitest';
import { levelFromXp, xpForLevel } from './xp-level';

describe('xp-level', () => {
  it('has the documented early thresholds', () => {
    expect(xpForLevel(2)).toBe(583);
    expect(xpForLevel(4)).toBe(3296);
    expect(xpForLevel(99)).toBe(10044428);
  });

  it('maps XP to level at every exact threshold (levels 2..150)', () => {
    for (let level = 2; level <= 150; level++) {
      expect(levelFromXp(xpForLevel(level))).toBe(level);
      expect(levelFromXp(xpForLevel(level) - 1)).toBe(level - 1);
    }
  });

  it('handles 0, negative and NaN', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(-1)).toBe(1);
    expect(levelFromXp(Number.NaN)).toBe(1);
  });
});
