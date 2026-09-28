import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PuzzleGame } from '../Game';

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
    render(<PuzzleGame mode="daily" onSolved={onSolved} />);

    // Puzzle pin-2 has white rook at d2
    const d2Cell = screen.getByTestId('chess-d2');
    expect(d2Cell).toBeInTheDocument();

    // Click d2 to select
    fireEvent.click(d2Cell);

    // Check if d7 can be clicked to make move d2d7
    const d7Cell = screen.getByTestId('chess-d7');
    expect(d7Cell).toBeInTheDocument();
    fireEvent.click(d7Cell);
  });

  it('allows dragging piece and dropping to make a move', () => {
    render(<PuzzleGame mode="daily" />);
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
    render(<PuzzleGame mode="daily" />);
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
    render(<PuzzleGame mode="daily" />);
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
    render(<PuzzleGame mode="daily" />);
    const flipBtn = screen.getByTestId('flip-board-btn');
    fireEvent.click(flipBtn);

    const d2Cell = screen.getByTestId('chess-d2');
    fireEvent.click(d2Cell);
    expect(d2Cell.getAttribute('aria-label')).toContain('selected');
  });
});
