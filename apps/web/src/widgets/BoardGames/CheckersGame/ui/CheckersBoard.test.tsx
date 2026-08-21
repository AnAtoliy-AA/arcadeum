import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CheckersBoard } from './CheckersBoard';
import type { Board, CheckersPlayer } from '../types';

const emptyBoard: Board = Array.from({ length: 8 }, () =>
  Array.from({ length: 8 }, () => null),
);

const players: CheckersPlayer[] = [
  { playerId: 'p1', color: 'light', alive: true, piecesRemaining: 12 },
  { playerId: 'p2', color: 'dark', alive: true, piecesRemaining: 12 },
];

describe('CheckersBoard', () => {
  it('renders 8x8 cells correctly', () => {
    render(
      <CheckersBoard
        board={emptyBoard}
        players={players}
        selectedPiece={null}
        disabled={false}
        ariaLabel="Checkers board"
        onCellClick={vi.fn()}
      />,
    );

    const board = screen.getByTestId('checkers-board');
    expect(board).toBeInTheDocument();
    expect(screen.getByTestId('checkers-cell-0-0')).toBeInTheDocument();
    expect(screen.getByTestId('checkers-cell-7-7')).toBeInTheDocument();
  });

  it('triggers onCellClick when a cell is clicked', () => {
    const handleCellClick = vi.fn();
    render(
      <CheckersBoard
        board={emptyBoard}
        players={players}
        selectedPiece={null}
        disabled={false}
        ariaLabel="Checkers board"
        onCellClick={handleCellClick}
      />,
    );

    const cell = screen.getByTestId('checkers-cell-2-3');
    fireEvent.click(cell);
    expect(handleCellClick).toHaveBeenCalledWith(2, 3);
  });

  it('renders king and regular pieces', () => {
    const boardWithPieces: Board = Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () => null),
    );
    boardWithPieces[2][3] = { playerId: 'p1', type: 'man' };
    boardWithPieces[5][4] = { playerId: 'p2', type: 'king' };

    render(
      <CheckersBoard
        board={boardWithPieces}
        players={players}
        selectedPiece={null}
        disabled={false}
        ariaLabel="Checkers board"
        onCellClick={vi.fn()}
      />,
    );

    expect(screen.getByText('👑')).toBeInTheDocument();
  });
});
