import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GoBoard } from './GoBoard';
import { GoThemeProvider } from '../lib/GoThemeContext';
import type { Cell } from '../types';

function emptyBoard(size: number): Cell[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null),
  );
}

function renderBoard(props: React.ComponentProps<typeof GoBoard>) {
  return render(
    <GoThemeProvider variant="adventure">
      <GoBoard {...props} />
    </GoThemeProvider>,
  );
}

describe('GoBoard', () => {
  it('renders an N×N grid of intersections', () => {
    renderBoard({
      board: emptyBoard(9),
      size: 9,
      disabled: false,
      lastMove: null,
      koPoint: null,
      myColor: 'black',
      onCellClick: vi.fn(),
    });
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(81);
  });

  it('fires onCellClick with clicked coordinates for empty points', () => {
    const onCellClick = vi.fn();
    renderBoard({
      board: emptyBoard(9),
      size: 9,
      disabled: false,
      lastMove: null,
      koPoint: null,
      myColor: 'black',
      onCellClick,
    });
    fireEvent.click(screen.getByTestId('go-cell-3-4'));
    expect(onCellClick).toHaveBeenCalledWith(3, 4);
  });

  it('marks the last move and ko point', () => {
    const board = emptyBoard(9);
    board[2][2] = 'black';
    renderBoard({
      board,
      size: 9,
      disabled: false,
      lastMove: { row: 2, col: 2 },
      koPoint: { row: 0, col: 1 },
      myColor: 'white',
      onCellClick: vi.fn(),
    });
    // Ko marker is rendered at the forbidden point (dashed circle span).
    const koCell = screen.getByTestId('go-cell-0-1');
    expect(koCell.querySelector('span[aria-hidden="true"]')).toBeTruthy();
  });

  it('disables interaction when disabled is set', () => {
    const onCellClick = vi.fn();
    renderBoard({
      board: emptyBoard(5),
      size: 5,
      disabled: true,
      lastMove: null,
      koPoint: null,
      myColor: 'black',
      onCellClick,
    });
    const cell = screen.getByTestId('go-cell-1-1');
    expect(cell).toHaveProperty('disabled', true);
    fireEvent.click(cell);
    expect(onCellClick).not.toHaveBeenCalled();
  });
});
