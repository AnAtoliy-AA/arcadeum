import { describe, expect, it } from 'vitest';
import {
  BOARD_SIZES,
  checkWinner,
  createEmptyBoard,
  isDraw,
  winLengthFor,
  type Board,
  type BoardSize,
  type Cell,
} from './game-logic';

function fromGrid(rows: string[]): { board: Board; size: BoardSize } {
  const size = rows.length as BoardSize;
  expect(BOARD_SIZES).toContain(size);
  const board: Cell[] = [];
  for (const row of rows) {
    expect(row.length).toBe(size);
    for (const ch of row) {
      if (ch === 'X' || ch === 'O') board.push(ch);
      else board.push(null);
    }
  }
  return { board, size };
}

describe('winLengthFor', () => {
  it('returns 3 for a 3x3 board', () => {
    expect(winLengthFor(3)).toBe(3);
  });

  it('returns 4 for a 5x5 board', () => {
    expect(winLengthFor(5)).toBe(4);
  });

  it('returns 5 for 7x7 and 9x9 boards', () => {
    expect(winLengthFor(7)).toBe(5);
    expect(winLengthFor(9)).toBe(5);
  });
});

describe('createEmptyBoard', () => {
  it('creates a board with size*size empty cells', () => {
    for (const size of BOARD_SIZES) {
      const board = createEmptyBoard(size);
      expect(board).toHaveLength(size * size);
      expect(board.every((c) => c === null)).toBe(true);
    }
  });
});

describe('checkWinner', () => {
  it('detects a horizontal win on a 3x3 board', () => {
    const { board, size } = fromGrid(['XXX', '.O.', 'O..']);
    const result = checkWinner(board, size, 3);
    expect(result).not.toBeNull();
    expect(result?.winner).toBe('X');
    expect(result?.line).toEqual([0, 1, 2]);
  });

  it('detects a vertical win on a 3x3 board', () => {
    const { board, size } = fromGrid(['OX.', 'OX.', 'OXX']);
    const result = checkWinner(board, size, 3);
    expect(result?.winner).toBe('O');
    expect(result?.line).toEqual([0, 3, 6]);
  });

  it('detects a diagonal win on a 3x3 board', () => {
    const { board, size } = fromGrid(['X..', 'OX.', 'OOX']);
    const result = checkWinner(board, size, 3);
    expect(result?.winner).toBe('X');
    expect(result?.line).toEqual([0, 4, 8]);
  });

  it('detects an anti-diagonal win', () => {
    const { board, size } = fromGrid(['..X', '.X.', 'XO.']);
    const result = checkWinner(board, size, 3);
    expect(result?.winner).toBe('X');
    expect(result?.line).toEqual([2, 4, 6]);
  });

  it('requires 4 in a row on a 5x5 board', () => {
    const threeInRow = fromGrid(['XXX..', '.....', '.....', '.....', '.....']);
    expect(checkWinner(threeInRow.board, threeInRow.size, 4)).toBeNull();

    const fourInRow = fromGrid(['XXXX.', '.....', '.....', '.....', '.....']);
    const result = checkWinner(fourInRow.board, fourInRow.size, 4);
    expect(result?.winner).toBe('X');
    expect(result?.line).toEqual([0, 1, 2, 3]);
  });

  it('returns null when there is no winner', () => {
    const { board, size } = fromGrid(['XOX', 'XOX', 'OXO']);
    expect(checkWinner(board, size, 3)).toBeNull();
  });
});

describe('isDraw', () => {
  it('is true when the board is full and there is no winner', () => {
    const { board } = fromGrid(['XOX', 'XOX', 'OXO']);
    expect(isDraw(board, null)).toBe(true);
  });

  it('is false when there is a winner', () => {
    const { board, size } = fromGrid(['XXX', 'OOX', 'XOO']);
    const w = checkWinner(board, size, 3);
    expect(isDraw(board, w)).toBe(false);
  });

  it('is false when the board still has empty cells', () => {
    const { board } = fromGrid(['X.O', '...', '...']);
    expect(isDraw(board, null)).toBe(false);
  });
});
