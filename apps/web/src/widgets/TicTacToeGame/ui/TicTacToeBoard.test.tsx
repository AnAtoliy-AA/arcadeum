import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TicTacToeBoard } from './TicTacToeBoard';
import { TicTacToeThemeProvider } from '../lib/TicTacToeThemeContext';
import type { TicTacToePlayer } from '../types';

const players: TicTacToePlayer[] = [
  { playerId: 'a', symbol: 'X', alive: true },
  { playerId: 'b', symbol: 'O', alive: true },
];

function renderBoard(props: React.ComponentProps<typeof TicTacToeBoard>) {
  return render(
    <TicTacToeThemeProvider variant="classic">
      <TicTacToeBoard {...props} />
    </TicTacToeThemeProvider>,
  );
}

describe('TicTacToeBoard', () => {
  it('renders an N×N grid', () => {
    renderBoard({
      board: [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ],
      winLine: null,
      players,
      teams: [],
      teamMode: false,
      onCellClick: vi.fn(),
    });
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(9);
  });

  it('fires onCellClick with the clicked coordinates', () => {
    const onCellClick = vi.fn();
    renderBoard({
      board: [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ],
      winLine: null,
      players,
      teams: [],
      teamMode: false,
      onCellClick,
    });
    fireEvent.click(screen.getByTestId('ttt-cell-1-2'));
    expect(onCellClick).toHaveBeenCalledWith(1, 2);
  });

  it('renders the owner symbol on occupied cells and disables them', () => {
    const onCellClick = vi.fn();
    renderBoard({
      board: [
        ['a', null, null],
        [null, null, null],
        [null, null, null],
      ],
      winLine: null,
      players,
      teams: [],
      teamMode: false,
      onCellClick,
    });
    const occupied = screen.getByTestId('ttt-cell-0-0');
    expect(occupied).toBeDisabled();
    expect(occupied.textContent).toBe('X');
    fireEvent.click(occupied);
    expect(onCellClick).not.toHaveBeenCalled();
  });

  it('marks winning cells with the highlight class', () => {
    renderBoard({
      board: [
        ['a', 'a', 'a'],
        ['b', 'b', null],
        [null, null, null],
      ],
      winLine: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ],
      players,
      teams: [],
      teamMode: false,
      onCellClick: vi.fn(),
    });
    expect(screen.getByTestId('ttt-cell-0-0').className).toContain(
      'ttt-winning',
    );
    expect(screen.getByTestId('ttt-cell-1-0').className).not.toContain(
      'ttt-winning',
    );
  });
});
