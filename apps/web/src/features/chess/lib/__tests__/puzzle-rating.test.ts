import { describe, it, expect, beforeEach } from 'vitest';
import {
  getUserPuzzleRating,
  getRatingHistory,
  calculateEloChange,
  recordRatingUpdate,
  clearRatingHistory,
} from '../puzzle-rating';

describe('puzzle-rating', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default rating of 1200 when empty', () => {
    expect(getUserPuzzleRating()).toBe(1200);
    expect(getRatingHistory()).toEqual([]);
  });

  it('calculates elo change correctly for wins and losses', () => {
    const winAgainstHarder = calculateEloChange(1200, 1400, true);
    expect(winAgainstHarder.change).toBeGreaterThan(15);
    expect(winAgainstHarder.newRating).toBe(1200 + winAgainstHarder.change);

    const lossAgainstEasier = calculateEloChange(1500, 1100, false);
    expect(lossAgainstEasier.change).toBeLessThan(-20);
    expect(lossAgainstEasier.newRating).toBe(1500 + lossAgainstEasier.change);
  });

  it('records rating update in local storage and returns history', () => {
    const update1 = recordRatingUpdate(
      { puzzleId: 'puz-1', rating: 1250, themes: ['fork'] },
      true,
    );
    expect(update1.previousRating).toBe(1200);
    expect(update1.newRating).toBeGreaterThan(1200);
    expect(getUserPuzzleRating()).toBe(update1.newRating);

    const history = getRatingHistory();
    expect(history.length).toBe(1);
    expect(history[0]?.puzzleId).toBe('puz-1');
    expect(history[0]?.motif).toBe('fork');
    expect(history[0]?.solved).toBe(true);

    clearRatingHistory();
    expect(getUserPuzzleRating()).toBe(1200);
    expect(getRatingHistory()).toEqual([]);
  });
});
