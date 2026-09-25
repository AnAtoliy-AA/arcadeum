import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordPuzzleResult,
  getPuzzleAnalytics,
  loadMistakesQueue,
  removeMistakeFromQueue,
  clearMistakesQueue,
} from '../puzzle-analytics';
import type { ChessPuzzle } from '../puzzle-api';

const samplePuzzle: ChessPuzzle = {
  puzzleId: 'puzzle_test_fork_1',
  fen: '6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1',
  moves: ['e1e8'],
  rating: 1500,
  themes: ['fork', 'endgame'],
  openingTags: ['Fork Tactical Test'],
};

describe('puzzle-analytics', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('records successful puzzle solve and updates streaks', () => {
    recordPuzzleResult(samplePuzzle, true);
    const analytics = getPuzzleAnalytics();

    expect(analytics.overall.totalAttempts).toBe(1);
    expect(analytics.overall.totalSolved).toBe(1);
    expect(analytics.overall.currentStreak).toBe(1);
    expect(analytics.overall.bestStreak).toBe(1);

    const forkTheme = analytics.themeBreakdown.find((t) => t.theme === 'fork');
    expect(forkTheme).toBeDefined();
    expect(forkTheme?.solved).toBe(1);
    expect(forkTheme?.accuracy).toBe(100);
  });

  it('records failed puzzle, resets streak, and enqueues to mistakes queue', () => {
    recordPuzzleResult(samplePuzzle, false, ['e1e2']);
    const analytics = getPuzzleAnalytics();

    expect(analytics.overall.totalAttempts).toBe(1);
    expect(analytics.overall.totalSolved).toBe(0);
    expect(analytics.overall.currentStreak).toBe(0);

    const mistakes = loadMistakesQueue();
    expect(mistakes.length).toBe(1);
    expect(mistakes[0]?.puzzle.puzzleId).toBe(samplePuzzle.puzzleId);
    expect(mistakes[0]?.wrongMoves).toEqual(['e1e2']);

    removeMistakeFromQueue(samplePuzzle.puzzleId);
    expect(loadMistakesQueue().length).toBe(0);
  });

  it('identifies the weakest theme accurately', () => {
    const pinPuzzle: ChessPuzzle = {
      ...samplePuzzle,
      puzzleId: 'puzzle_pin_1',
      themes: ['pin'],
    };

    recordPuzzleResult(pinPuzzle, false);
    recordPuzzleResult(pinPuzzle, false);
    recordPuzzleResult(pinPuzzle, true);

    const analytics = getPuzzleAnalytics();
    expect(analytics.weakestTheme).toBe('pin');

    clearMistakesQueue();
    expect(loadMistakesQueue().length).toBe(0);
  });
});
