import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PuzzleDuel } from '../PuzzleDuel';

vi.mock('@/features/chess/lib/puzzle-api', () => ({
  getRandomPuzzle: vi.fn().mockResolvedValue({
    puzzleId: 'duel_test_1',
    fen: '6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1',
    moves: ['e1e8'],
    rating: 1500,
    themes: ['backRankMate'],
    openingTags: ['Duel Test'],
  }),
}));

if (typeof globalThis.ResizeObserver === 'undefined') {
  (globalThis as Record<string, unknown>).ResizeObserver = class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };
}

describe('PuzzleDuel', () => {
  it('renders the duel lobby with difficulty selectors', () => {
    render(<PuzzleDuel />);

    expect(screen.getByTestId('puzzle-duel-lobby')).toBeInTheDocument();
    expect(screen.getByText('Puzzle Duel')).toBeInTheDocument();
    expect(screen.getByTestId('duel-diff-easy')).toBeInTheDocument();
    expect(screen.getByTestId('duel-diff-medium')).toBeInTheDocument();
    expect(screen.getByTestId('duel-diff-hard')).toBeInTheDocument();
    expect(screen.getByTestId('start-duel-btn')).toBeInTheDocument();
  });

  it('selects difficulty and starts duel session', async () => {
    render(<PuzzleDuel />);

    const hardDiff = screen.getByTestId('duel-diff-hard');
    fireEvent.click(hardDiff);

    const startBtn = screen.getByTestId('start-duel-btn');
    fireEvent.click(startBtn);

    expect(await screen.findByTestId('puzzle-duel-match')).toBeInTheDocument();
    expect(screen.getByTestId('duel-timer')).toBeInTheDocument();
  });
});
