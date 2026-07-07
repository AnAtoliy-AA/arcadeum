import {
  createEmptyBoard,
  expandBoard,
  findWinningLine,
  indexToCentered,
  isBoardFull,
  nextTurnIndex,
} from './tic-tac-toe.utils';

describe('tic-tac-toe utils', () => {
  describe('createEmptyBoard', () => {
    it('returns an N×N board filled with null', () => {
      const board = createEmptyBoard(5);
      expect(board).toHaveLength(5);
      board.forEach((row) => {
        expect(row).toHaveLength(5);
        expect(row.every((cell) => cell === null)).toBe(true);
      });
    });

    it('returns separate row arrays (not shared references)', () => {
      const board = createEmptyBoard(3);
      board[0][0] = 'a';
      expect(board[1][0]).toBe(null);
    });
  });

  describe('findWinningLine', () => {
    it('detects a horizontal line of the required length', () => {
      const board = createEmptyBoard(3);
      board[1] = ['x', 'x', 'x'];
      const line = findWinningLine(board, 3, 3, 'x');
      expect(line).toHaveLength(3);
      expect(line).toEqual([
        { row: 1, col: 0 },
        { row: 1, col: 1 },
        { row: 1, col: 2 },
      ]);
    });

    it('detects a vertical line of the required length', () => {
      const board = createEmptyBoard(3);
      board[0][2] = 'o';
      board[1][2] = 'o';
      board[2][2] = 'o';
      const line = findWinningLine(board, 3, 3, 'o');
      expect(line).toEqual([
        { row: 0, col: 2 },
        { row: 1, col: 2 },
        { row: 2, col: 2 },
      ]);
    });

    it('detects a top-left → bottom-right diagonal', () => {
      const board = createEmptyBoard(3);
      board[0][0] = 'x';
      board[1][1] = 'x';
      board[2][2] = 'x';
      const line = findWinningLine(board, 3, 3, 'x');
      expect(line).toEqual([
        { row: 0, col: 0 },
        { row: 1, col: 1 },
        { row: 2, col: 2 },
      ]);
    });

    it('detects a top-right → bottom-left diagonal', () => {
      const board = createEmptyBoard(3);
      board[0][2] = 'x';
      board[1][1] = 'x';
      board[2][0] = 'x';
      const line = findWinningLine(board, 3, 3, 'x');
      expect(line).toEqual([
        { row: 0, col: 2 },
        { row: 1, col: 1 },
        { row: 2, col: 0 },
      ]);
    });

    it('returns null when no line of required length exists', () => {
      const board = createEmptyBoard(3);
      board[0] = ['x', 'x', 'o'];
      expect(findWinningLine(board, 3, 3, 'x')).toBeNull();
    });

    it('detects a 4-in-a-row on a 5×5 board', () => {
      const board = createEmptyBoard(5);
      board[2][1] = 'x';
      board[2][2] = 'x';
      board[2][3] = 'x';
      board[2][4] = 'x';
      const line = findWinningLine(board, 5, 4, 'x');
      expect(line).toHaveLength(4);
    });

    it('detects a 5-in-a-row diagonal on a 9×9 board', () => {
      const board = createEmptyBoard(9);
      for (let i = 0; i < 5; i++) {
        board[i + 2][i + 1] = 'o';
      }
      const line = findWinningLine(board, 9, 5, 'o');
      expect(line).toHaveLength(5);
    });
  });

  describe('isBoardFull', () => {
    it('returns true for a fully populated board', () => {
      const board = [
        ['x', 'o', 'x'],
        ['o', 'x', 'o'],
        ['o', 'x', 'o'],
      ];
      expect(isBoardFull(board)).toBe(true);
    });

    it('returns false when any cell is null', () => {
      const board = createEmptyBoard(3);
      board[0][0] = 'x';
      expect(isBoardFull(board)).toBe(false);
    });
  });

  describe('nextTurnIndex', () => {
    it('advances by one in the simple case', () => {
      expect(nextTurnIndex(0, ['a', 'b', 'c'], () => true)).toBe(1);
      expect(nextTurnIndex(2, ['a', 'b', 'c'], () => true)).toBe(0);
    });

    it('skips dead entries', () => {
      const isAlive = (id: string) => id !== 'b';
      expect(nextTurnIndex(0, ['a', 'b', 'c'], isAlive)).toBe(2);
    });

    it('returns the current index when only one entry is alive', () => {
      const isAlive = (id: string) => id === 'a';
      expect(nextTurnIndex(0, ['a', 'b', 'c'], isAlive)).toBe(0);
    });
  });

  describe('expandBoard', () => {
    it('returns the same board when far from all edges', () => {
      const board = createEmptyBoard(9);
      const result = expandBoard(board, 4, 4, 3);
      expect(result.board).toBe(board);
      expect(result.originDelta).toEqual({ row: 0, col: 0 });
    });

    it('expands when mark is placed near the top edge', () => {
      const board = createEmptyBoard(9);
      board[0][4] = 'x';
      const result = expandBoard(board, 0, 4, 3);
      expect(result.board.length).toBeGreaterThan(9);
      expect(result.originDelta.row).toBeGreaterThan(0);
      expect(
        result.board[0 + result.originDelta.row][4 + result.originDelta.col],
      ).toBe('x');
    });

    it('expands when mark is placed near the bottom edge', () => {
      const board = createEmptyBoard(9);
      board[8][4] = 'x';
      const result = expandBoard(board, 8, 4, 3);
      expect(result.board.length).toBeGreaterThan(9);
    });

    it('expands when mark is placed near the left edge', () => {
      const board = createEmptyBoard(9);
      board[4][0] = 'x';
      const result = expandBoard(board, 4, 0, 3);
      expect(result.board[0].length).toBeGreaterThan(9);
      expect(result.originDelta.col).toBeGreaterThan(0);
    });

    it('expands when mark is placed near the right edge', () => {
      const board = createEmptyBoard(9);
      board[4][8] = 'x';
      const result = expandBoard(board, 4, 8, 3);
      expect(result.board[0].length).toBeGreaterThan(9);
    });

    it('expands in both axes when placed in a corner', () => {
      const board = createEmptyBoard(9);
      board[0][0] = 'x';
      const result = expandBoard(board, 0, 0, 3);
      expect(result.board.length).toBeGreaterThan(9);
      expect(result.board[0].length).toBeGreaterThan(9);
    });

    it('preserves existing marks after expansion', () => {
      const board = createEmptyBoard(9);
      board[0][0] = 'x';
      board[8][8] = 'o';
      const result = expandBoard(board, 0, 0, 3);
      const cells = result.board.flat().filter((c) => c !== null);
      expect(cells).toContain('x');
      expect(cells).toContain('o');
    });

    it('rounds expansion to even numbers to prevent origin drift', () => {
      const board = createEmptyBoard(9);
      board[0][4] = 'x';
      const result = expandBoard(board, 0, 4, 3);
      const addedRows = result.board.length - 9;
      expect(addedRows % 2).toBe(0);
    });

    it('rounds column expansion to even numbers', () => {
      const board = createEmptyBoard(9);
      board[4][0] = 'x';
      const result = expandBoard(board, 4, 0, 3);
      const addedCols = result.board[0].length - 9;
      expect(addedCols % 2).toBe(0);
    });

    it('expands correctly with margin=1', () => {
      const board = createEmptyBoard(9);
      board[0][4] = 'x';
      const result = expandBoard(board, 0, 4, 1);
      expect(result.board.length).toBe(11);
      expect(result.originDelta.row).toBe(1);
    });

    it('expands correctly with margin=2', () => {
      const board = createEmptyBoard(9);
      board[0][4] = 'x';
      const result = expandBoard(board, 0, 4, 2);
      expect(result.board.length).toBe(11);
      expect(result.originDelta.row).toBe(1);
    });
  });

  describe('indexToCentered', () => {
    it('converts board index to centered coordinates', () => {
      const origin = { row: 4, col: 4 };
      expect(indexToCentered({ row: 4, col: 4 }, origin)).toEqual({
        row: 0,
        col: 0,
      });
      expect(indexToCentered({ row: 0, col: 0 }, origin)).toEqual({
        row: -4,
        col: -4,
      });
      expect(indexToCentered({ row: 8, col: 8 }, origin)).toEqual({
        row: 4,
        col: 4,
      });
    });
  });
});
