import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PuzzleGame } from '../Game';
import type { ChessPuzzle } from '@/features/chess/lib/puzzle-api';

const TEST_PUZZLE: ChessPuzzle = {
  puzzleId: 'test-puzzle-1',
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/3R4/3K4 w KQkq - 0 1',
  moves: ['d2d7'],
  rating: 1200,
  themes: ['pin'],
  openingTags: ['Test'],
};

beforeEach(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    (globalThis as Record<string, unknown>).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

describe('PuzzleGame', () => {
  it('allows selecting piece and making a move', () => {
    const onSolved = vi.fn();
    render(<PuzzleGame customPuzzle={TEST_PUZZLE} onSolved={onSolved} />);

    const d2Cell = screen.getByTestId('chess-d2');
    expect(d2Cell).toBeInTheDocument();

    fireEvent.click(d2Cell);

    const d7Cell = screen.getByTestId('chess-d7');
    expect(d7Cell).toBeInTheDocument();
    fireEvent.click(d7Cell);
  });

  it('allows dragging piece and dropping to make a move', () => {
    render(<PuzzleGame customPuzzle={TEST_PUZZLE} />);
    const d2Cell = screen.getByTestId('chess-d2');
    const d7Cell = screen.getByTestId('chess-d7');

    const dataTransfer = {
      data: {} as Record<string, string>,
      setData(k: string, v: string) {
        this.data[k] = v;
      },
      getData(k: string) {
        return this.data[k] || '';
      },
      effectAllowed: 'move',
    };

    fireEvent.dragStart(d2Cell, { dataTransfer });
    fireEvent.dragOver(d7Cell, { dataTransfer });
    fireEvent.drop(d7Cell, { dataTransfer });
  });

  it('allows switching selection between friendly pieces without failing puzzle', () => {
    render(<PuzzleGame customPuzzle={TEST_PUZZLE} />);
    const d2Cell = screen.getByTestId('chess-d2');
    const d1Cell = screen.getByTestId('chess-d1');

    fireEvent.click(d2Cell);
    expect(d2Cell.getAttribute('aria-label')).toContain('selected');

    fireEvent.click(d1Cell);
    expect(d1Cell.getAttribute('aria-label')).toContain('selected');
    expect(d2Cell.getAttribute('aria-label')).not.toContain('selected');
    expect(screen.queryByText('Incorrect : try again')).not.toBeInTheDocument();
  });

  it('deselects piece when clicking empty or illegal square without failing puzzle', () => {
    render(<PuzzleGame customPuzzle={TEST_PUZZLE} />);
    const d2Cell = screen.getByTestId('chess-d2');
    const a4Cell = screen.getByTestId('chess-a4');

    fireEvent.click(d2Cell);
    expect(d2Cell.getAttribute('aria-label')).toContain('selected');

    fireEvent.click(a4Cell);
    expect(
      screen.getByTestId('chess-d2').getAttribute('aria-label'),
    ).not.toContain('selected');
    expect(screen.queryByText('Incorrect : try again')).not.toBeInTheDocument();
  });

  it('keeps board playable after flip board button is clicked', () => {
    render(<PuzzleGame customPuzzle={TEST_PUZZLE} />);
    const flipBtn = screen.getByTestId('flip-board-btn');
    fireEvent.click(flipBtn);

    const d2Cell = screen.getByTestId('chess-d2');
    fireEvent.click(d2Cell);
    expect(d2Cell.getAttribute('aria-label')).toContain('selected');
  });
});
