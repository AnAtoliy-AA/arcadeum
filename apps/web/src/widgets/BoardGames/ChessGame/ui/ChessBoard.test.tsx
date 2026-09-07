import { render, screen } from '@testing-library/react';
import { vi, beforeEach } from 'vitest';
import { ChessBoard } from './ChessBoard';
import type { Board, File, Rank, PieceColor } from '../types';
import { FILES } from '../types';

beforeEach(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    (globalThis as Record<string, unknown>).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

function createEmptyBoard(): Board {
  return Array.from({ length: 8 }, () => Array(8).fill(null));
}

function createBoardWithPawn(color: PieceColor): Board {
  const board = createEmptyBoard();
  const row = color === 'white' ? 6 : 1;
  board[row][4] = { type: 'pawn', color };
  return board;
}

function renderWithProvider(ui: React.ReactElement) {
  return render(ui);
}

describe('ChessBoard', () => {
  const defaultProps = {
    myColor: 'white' as PieceColor,
    isFlipped: false,
    disabled: false,
    selectedSquare: null,
    legalMoves: [],
    lastMove: null,
    isCheck: false,
    kingPosition: null,
    onSquareClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 64 squares', () => {
    const board = createEmptyBoard();
    renderWithProvider(<ChessBoard {...defaultProps} board={board} />);
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(64);
  });

  it('calls onSquareClick when a square is clicked', () => {
    const board = createBoardWithPawn('white');
    const onSquareClick = vi.fn();
    renderWithProvider(
      <ChessBoard
        {...defaultProps}
        board={board}
        onSquareClick={onSquareClick}
      />,
    );
    const cell = screen.getByTestId('chess-e2');
    cell.click();
    expect(onSquareClick).toHaveBeenCalledWith('e', 2);
  });

  it('renders pieces with correct symbols', () => {
    const board = createBoardWithPawn('white');
    renderWithProvider(<ChessBoard {...defaultProps} board={board} />);
    const cell = screen.getByTestId('chess-e2');
    expect(cell.textContent).toContain('♙');
  });

  it('shows legal move indicator', () => {
    const board = createBoardWithPawn('white');
    const legalMoves = [{ file: 'e' as File, rank: 4 as Rank }];
    renderWithProvider(
      <ChessBoard {...defaultProps} board={board} legalMoves={legalMoves} />,
    );
    const cell = screen.getByTestId('chess-e4');
    expect(cell.getAttribute('aria-label')).toContain('legal move');
  });

  it('disables interaction when disabled prop is true', () => {
    const board = createBoardWithPawn('white');
    const onSquareClick = vi.fn();
    renderWithProvider(
      <ChessBoard
        {...defaultProps}
        board={board}
        onSquareClick={onSquareClick}
        disabled
      />,
    );
    const cell = screen.getByTestId('chess-e2');
    cell.click();
    expect(onSquareClick).not.toHaveBeenCalled();
  });

  it('shows file labels below the board', () => {
    const board = createEmptyBoard();
    renderWithProvider(<ChessBoard {...defaultProps} board={board} />);
    FILES.forEach((file) => {
      expect(screen.getAllByText(file).length).toBeGreaterThan(0);
    });
  });
});
