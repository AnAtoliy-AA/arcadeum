import {
  levelFromXp,
  xpForLevel,
  xpForResult,
  xpProgress,
  DEFAULT_XP,
} from './xp-level';

describe('xp-level', () => {
  it('documents the real early thresholds', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(583);
    expect(xpForLevel(4)).toBe(3296);
    expect(xpForLevel(99)).toBe(10044428);
  });

  it('maps XP to level at every exact threshold (levels 2..150)', () => {
    for (let level = 2; level <= 150; level++) {
      const threshold = xpForLevel(level);
      expect(levelFromXp(threshold)).toBe(level);
      expect(levelFromXp(threshold - 1)).toBe(level - 1);
    }
  });

  it('regression: boundaries the float inverse used to get wrong', () => {
    expect(levelFromXp(13353)).toBe(7);
    expect(levelFromXp(10044428)).toBe(99);
  });

  it('treats 0, negative, NaN as level 1', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(-5)).toBe(1);
    expect(levelFromXp(Number.NaN)).toBe(1);
    expect(levelFromXp(582)).toBe(1);
  });

  it('is monotonic', () => {
    let prev = 1;
    for (let xp = 0; xp < 20000; xp += 7) {
      const lvl = levelFromXp(xp);
      expect(lvl).toBeGreaterThanOrEqual(prev);
      prev = lvl;
    }
  });

  it('xpProgress is consistent with thresholds', () => {
    const p = xpProgress(xpForLevel(7));
    expect(p.level).toBe(7);
    expect(p.xpInLevel).toBe(0);
    expect(p.progress).toBe(0);
    const q = xpProgress(xpForLevel(8) - 1);
    expect(q.level).toBe(7);
    expect(q.progress).toBeLessThan(1);
  });

  it('xpForResult applies solo/bot coefficients', () => {
    const s = {
      winXp: DEFAULT_XP.WIN,
      lossXp: DEFAULT_XP.LOSS,
      drawXp: DEFAULT_XP.DRAW,
      soloCoefficient: DEFAULT_XP.SOLO_COEFF,
      botCoefficient: DEFAULT_XP.BOT_COEFF,
    };
    expect(xpForResult('won', s, false, false)).toBe(100);
    expect(xpForResult('draw', s, false, false)).toBe(60);
    expect(xpForResult('lost', s, false, true)).toBe(8);
    expect(xpForResult('won', s, true, false)).toBe(10);
  });
});
