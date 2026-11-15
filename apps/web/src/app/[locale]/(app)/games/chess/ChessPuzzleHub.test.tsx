import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChessPuzzleHub } from './ChessPuzzleHub';

describe('ChessPuzzleHub', () => {
  const sampleHrefs = {
    dailyPuzzleHref: '/en/games/chess/puzzles/daily',
    ratedPuzzlesHref: '/en/games/chess/puzzles',
    puzzleRushHref: '/en/games/chess/puzzles/rush',
    coordinatesHref: '/en/games/chess/learn',
  };

  it('renders puzzles and training header', () => {
    render(<ChessPuzzleHub {...sampleHrefs} />);

    expect(screen.getByText('Chess Puzzles & Tactics')).toBeInTheDocument();
    expect(screen.getByText('Rated Puzzles ➔')).toBeInTheDocument();
    expect(screen.getAllByText('Puzzle Rush ➔').length).toBeGreaterThanOrEqual(
      1,
    );
  });

  it('renders quick access cards for all puzzle modes', () => {
    render(<ChessPuzzleHub {...sampleHrefs} />);

    expect(screen.getByText('Daily Puzzle')).toBeInTheDocument();
    expect(screen.getByText('Rated Puzzles')).toBeInTheDocument();
    expect(screen.getByText('Puzzle Rush')).toBeInTheDocument();
    expect(screen.getByText('Coordinates')).toBeInTheDocument();
  });

  it('renders interactive daily puzzle teaser section', () => {
    render(<ChessPuzzleHub {...sampleHrefs} />);

    expect(
      screen.getByText('Solve the Daily Chess Puzzle'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Puzzle Chess Board')).toBeInTheDocument();
  });
});
