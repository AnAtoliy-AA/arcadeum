import { render, screen } from '@testing-library/react';
import { vi, beforeEach } from 'vitest';
import { ChessBoard } from './ChessBoard';
import type { Board, File, Rank, PieceColor } from '../types';
import { FILES } from '../types';
import { enMessages } from '@/shared/i18n/messages/games/chess/en';

// Resolve keys against the real English chess messages so labels are
// asserted as users (and screen readers) get them.
vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      const path = key.replace(/^games\./, '').split('.');
      let value: unknown = enMessages;
      for (const k of path) {
        value =
          value && typeof value === 'object'
            ? (value as Record<string, unknown>)[k]
            : undefined;
      }
      if (typeof value !== 'string') return key;
      return value.replace(/\{\{(\w+)\}\}/g, (_, p: string) =>
        String(params?.[p] ?? ''),
      );
    },
  }),
}));

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

  it('does not render floating streamer buttons on the chessboard', () => {
    const board = createEmptyBoard();
    renderWithProvider(<ChessBoard {...defaultProps} board={board} />);

    expect(screen.queryByTitle('Streamer Best Move Arrow')).toBeNull();
    expect(screen.queryByTitle('Streamer Threats & Attacks')).toBeNull();
  });

  it('renders premove ghost pieces and queued indicators', () => {
    const board = createBoardWithPawn('white');
    renderWithProvider(
      <ChessBoard
        {...defaultProps}
        board={board}
        premoveQueue={[
          {
            from: { file: 'e', rank: 2 },
            to: { file: 'e', rank: 4 },
            piece: { type: 'pawn', color: 'white' },
          },
        ]}
      />,
    );

    const targetCell = screen.getByTestId('chess-e4');
    expect(targetCell.className).toContain('ring-amber-400/70');
  });

  it("stops page scrolling only on squares holding the player's own pieces", () => {
    const board = createBoardWithPawn('white');
    board[1][3] = { type: 'pawn', color: 'black' };
    renderWithProvider(<ChessBoard {...defaultProps} board={board} />);
    const own = screen.getByTestId('chess-e2');
    expect(own.className).toContain('touch-none');
    expect(own.getAttribute('draggable')).toBeNull();
    expect(own.getAttribute('data-movable')).toBe('true');
    expect(screen.getByTestId('chess-d7').className).toContain(
      'touch-manipulation',
    );
    expect(screen.getByTestId('chess-d7').getAttribute('data-movable')).toBe(
      null,
    );
    expect(screen.getByTestId('chess-e4').className).toContain(
      'touch-manipulation',
    );
  });

  it('keeps every square scrollable when the board is disabled', () => {
    const board = createBoardWithPawn('white');
    renderWithProvider(<ChessBoard {...defaultProps} board={board} disabled />);
    expect(screen.getByTestId('chess-e2').className).toContain(
      'touch-manipulation',
    );
    expect(screen.getByTestId('chess-e2').getAttribute('data-movable')).toBe(
      null,
    );
  });

  it('respects reduced motion for the check highlight', () => {
    const board = createEmptyBoard();
    board[7][4] = { type: 'king', color: 'white' };
    renderWithProvider(
      <ChessBoard
        {...defaultProps}
        board={board}
        isCheck
        kingPosition={{ file: 'e', rank: 1 }}
      />,
    );
    const king = screen.getByTestId('chess-e1');
    expect(king.className).toContain('motion-safe:animate-pulse');
    expect(king.className).not.toMatch(/(^|\s)animate-pulse/);
  });

  it('gives squares localized screen-reader labels', () => {
    const board = createBoardWithPawn('white');
    renderWithProvider(
      <ChessBoard
        {...defaultProps}
        board={board}
        selectedSquare={{ file: 'e', rank: 2 }}
        lastMove={{ from: { file: 'e', rank: 2 }, to: { file: 'e', rank: 3 } }}
      />,
    );
    expect(screen.getByTestId('chess-e2').getAttribute('aria-label')).toBe(
      'e2 white pawn, selected, last move',
    );
    expect(screen.getByTestId('chess-a8').getAttribute('aria-label')).toBe(
      'a8',
    );
  });

  it('hides edge coordinates when the preference is off', () => {
    window.localStorage.setItem('arcadeum:chess:showCoordinates', 'false');
    renderWithProvider(
      <ChessBoard {...defaultProps} board={createEmptyBoard()} />,
    );
    expect(screen.getByTestId('chess-a1').textContent).toBe('');
    window.localStorage.removeItem('arcadeum:chess:showCoordinates');
  });
});
