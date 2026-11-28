import { describe, expect, it } from 'vitest';
import {
  applyDeterministicDecay,
  createInitialPet,
} from '@arcadeum/games-core';
import {
  buildAwaySummary,
  formatAwayDuration,
} from './arcade-pet-away-summary';

const HOUR = 60 * 60 * 1000;

function makePet(now: number) {
  const pet = createInitialPet({
    id: 'p1',
    name: 'Bit',
    species: 'dragon',
    now,
  } as Parameters<typeof createInitialPet>[0]);
  return { ...pet, stage: 'baby' as const };
}

describe('buildAwaySummary', () => {
  it('returns null for short absences', () => {
    const start = 1_000_000;
    const before = makePet(start);
    const after = applyDeterministicDecay(before, start + 5 * 60_000);
    expect(buildAwaySummary(before, after, start + 5 * 60_000)).toBeNull();
  });

  it('reports hunger drop after a long absence', () => {
    const start = 1_000_000;
    const before = makePet(start);
    const now = start + 6 * HOUR;
    const after = applyDeterministicDecay(before, now);
    const summary = buildAwaySummary(before, after, now);
    expect(summary).not.toBeNull();
    expect(summary?.petName).toBe('Bit');
    expect(summary?.hungerDrop).toBeGreaterThan(0);
  });
});

describe('formatAwayDuration', () => {
  it('formats minutes, hours and days', () => {
    expect(formatAwayDuration(20 * 60_000)).toBe('20m');
    expect(formatAwayDuration(5 * HOUR + 10 * 60_000)).toBe('5h 10m');
    expect(formatAwayDuration(50 * HOUR)).toBe('2d 2h');
  });
});
