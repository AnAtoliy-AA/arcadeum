import {
  createEmptyBoard,
  findWinningLine,
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
});
