import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PuzzleRatingChart } from '../PuzzleRatingChart';
import type { RatingHistoryEntry } from '@/features/chess/lib/puzzle-rating';

describe('PuzzleRatingChart', () => {
  it('renders empty prompt when history is empty', () => {
    render(<PuzzleRatingChart history={[]} currentRating={1200} />);
    expect(screen.getByTestId('puzzle-rating-chart')).toBeDefined();
    expect(
      screen.getByText(
        /Solve more rated puzzles to generate your tactical rating curve!/,
      ),
    ).toBeDefined();
  });

  it('renders SVG curve and recent deltas when history has data', () => {
    const history: RatingHistoryEntry[] = [
      {
        timestamp: 1000,
        rating: 1220,
        change: 20,
        puzzleId: 'p1',
        puzzleRating: 1200,
        solved: true,
        motif: 'fork',
      },
      {
        timestamp: 2000,
        rating: 1245,
        change: 25,
        puzzleId: 'p2',
        puzzleRating: 1300,
        solved: true,
        motif: 'pin',
      },
    ];

    render(<PuzzleRatingChart history={history} currentRating={1245} />);
    expect(screen.getByText('1245')).toBeDefined();
    expect(screen.getByText('Peak 1245')).toBeDefined();
    expect(screen.getByText('+20')).toBeDefined();
    expect(screen.getByText('+25')).toBeDefined();
  });
});
