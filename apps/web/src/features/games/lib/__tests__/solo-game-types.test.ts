import { describe, it, expect } from 'vitest';
import {
  soloRatingDelta,
  soloRatingBaseGain,
  SOLO_RATING_DIFFICULTY_MAP,
} from '../solo-game-types';

describe('soloRatingBaseGain', () => {
  it('returns 6 for beginner/easy', () => {
    expect(soloRatingBaseGain('beginner')).toBe(6);
    expect(soloRatingBaseGain('easy')).toBe(6);
  });

  it('returns 10 for default/medium/intermediate', () => {
    expect(soloRatingBaseGain('default')).toBe(10);
    expect(soloRatingBaseGain('medium')).toBe(10);
    expect(soloRatingBaseGain('intermediate')).toBe(10);
  });

  it('returns 16 for hard/expert', () => {
    expect(soloRatingBaseGain('hard')).toBe(16);
    expect(soloRatingBaseGain('expert')).toBe(16);
  });

  it('returns 10 for unknown difficulty', () => {
    expect(soloRatingBaseGain('unknown')).toBe(10);
  });
});

describe('soloRatingDelta', () => {
  it('returns full gain for win without undo', () => {
    expect(soloRatingDelta('default', true, false)).toBe(10);
    expect(soloRatingDelta('hard', true, false)).toBe(16);
    expect(soloRatingDelta('easy', true, false)).toBe(6);
  });

  it('returns half gain for win with undo', () => {
    expect(soloRatingDelta('default', true, true)).toBe(5);
    expect(soloRatingDelta('hard', true, true)).toBe(8);
    expect(soloRatingDelta('easy', true, true)).toBe(3);
  });

  it('returns negative full loss for loss without undo', () => {
    expect(soloRatingDelta('default', false, false)).toBe(-10);
    expect(soloRatingDelta('hard', false, false)).toBe(-16);
  });

  it('returns reduced loss for loss with undo', () => {
    expect(soloRatingDelta('default', false, true)).toBe(-8);
    expect(soloRatingDelta('hard', false, true)).toBe(-12);
  });

  it('handles all difficulty levels', () => {
    for (const [diff, expected] of Object.entries(SOLO_RATING_DIFFICULTY_MAP)) {
      const winDelta = soloRatingDelta(diff, true, false);
      expect(winDelta).toBe(expected);
      const lossDelta = soloRatingDelta(diff, false, false);
      expect(lossDelta).toBe(-expected);
    }
  });
});
