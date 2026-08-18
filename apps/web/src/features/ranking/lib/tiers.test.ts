import { describe, it, expect } from 'vitest';
import { tierForRating, tierMeta } from './tiers';

describe('tierForRating', () => {
  it('maps ratings to roadmap tier thresholds', () => {
    expect(tierForRating(0)).toBe('bronze');
    expect(tierForRating(1199)).toBe('bronze');
    expect(tierForRating(1200)).toBe('silver');
    expect(tierForRating(1399)).toBe('silver');
    expect(tierForRating(1400)).toBe('gold');
    expect(tierForRating(1599)).toBe('gold');
    expect(tierForRating(1600)).toBe('platinum');
    expect(tierForRating(1799)).toBe('platinum');
    expect(tierForRating(1800)).toBe('diamond');
    expect(tierForRating(1999)).toBe('diamond');
    expect(tierForRating(2000)).toBe('master');
    expect(tierForRating(2500)).toBe('master');
  });
});

describe('tierMeta', () => {
  it('returns the meta for a known tier', () => {
    expect(tierMeta('diamond').label).toBe('Diamond');
    expect(tierMeta('master').min).toBe(2000);
  });

  it('falls back to bronze for unknown/empty tiers', () => {
    expect(tierMeta('bogus' as never).tier).toBe('bronze');
    expect(tierMeta(null).tier).toBe('bronze');
    expect(tierMeta(undefined).tier).toBe('bronze');
  });
});
