import { describe, expect, it } from 'vitest';
import { daysRemaining, seasonAccent, seasonProgress } from './progress';

const DAY_MS = 86_400_000;

describe('seasonProgress', () => {
  const start = '2026-07-01T00:00:00.000Z';
  const end = '2026-10-01T00:00:00.000Z';

  it('returns 0 before the season starts', () => {
    expect(seasonProgress(start, end, Date.parse(start) - DAY_MS)).toBe(0);
  });

  it('returns 1 after the season ends', () => {
    expect(seasonProgress(start, end, Date.parse(end) + DAY_MS)).toBe(1);
  });

  it('returns ~0.5 at the midpoint', () => {
    const mid = (Date.parse(start) + Date.parse(end)) / 2;
    expect(seasonProgress(start, end, mid)).toBeCloseTo(0.5, 5);
  });

  it('clamps to [0, 1]', () => {
    for (let i = -10; i <= 110; i += 10) {
      const p = seasonProgress(start, end, Date.parse(start) + i * DAY_MS * 3);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
  });

  it('returns 0 for invalid or inverted windows', () => {
    expect(seasonProgress(end, start)).toBe(0);
    expect(seasonProgress(start, end, NaN as unknown as number)).toBe(0);
    expect(seasonProgress('not-a-date', end)).toBe(0);
    expect(seasonProgress(start, '')).toBe(0);
  });
});

describe('daysRemaining', () => {
  it('rounds partial days up', () => {
    const end = new Date(Date.now() + 1.5 * DAY_MS).toISOString();
    expect(daysRemaining(end)).toBe(2);
  });

  it('floors at zero after the deadline', () => {
    const past = new Date(Date.now() - 5 * DAY_MS).toISOString();
    expect(daysRemaining(past)).toBe(0);
  });

  it('returns 0 for unparseable dates', () => {
    expect(daysRemaining('garbage')).toBe(0);
  });

  it('counts full days exactly', () => {
    const end = new Date(Date.now() + 12 * DAY_MS).toISOString();
    expect(daysRemaining(end)).toBe(12);
  });
});

describe('seasonAccent', () => {
  it('maps every theme to a stable hex accent', () => {
    const themes = [
      'ember',
      'tides',
      'frost',
      'bloom',
      'eclipse',
      'aurora',
      'dawn',
      'dusk',
    ] as const;
    for (const theme of themes) {
      expect(seasonAccent(theme)).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('falls back to ember for unknown themes', () => {
    expect(seasonAccent('nope' as never)).toBe(seasonAccent('ember'));
    expect(seasonAccent(undefined)).toBe(seasonAccent('ember'));
  });
});
