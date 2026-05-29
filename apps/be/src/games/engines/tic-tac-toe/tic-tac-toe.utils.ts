import type { CellValue, WinLineCell } from './tic-tac-toe.types';

export function createEmptyBoard(size: number): CellValue[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null as CellValue),
  );
}

const DIRECTIONS: Array<[number, number]> = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

export function findWinningLine(
  board: CellValue[][],
  size: number,
  winLength: number,
  owner: string,
): WinLineCell[] | null {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] !== owner) continue;
      for (const [dRow, dCol] of DIRECTIONS) {
        const endRow = row + dRow * (winLength - 1);
        const endCol = col + dCol * (winLength - 1);
        if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) {
          continue;
        }
        let matched = true;
        const line: WinLineCell[] = [];
        for (let step = 0; step < winLength; step++) {
          const r = row + dRow * step;
          const c = col + dCol * step;
          if (board[r][c] !== owner) {
            matched = false;
            break;
          }
          line.push({ row: r, col: c });
        }
        if (matched) return line;
      }
    }
  }
  return null;
}

export function isBoardFull(board: CellValue[][]): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (cell === null) return false;
    }
  }
  return true;
}

export function nextTurnIndex(
  currentIndex: number,
  order: string[],
  isAlive: (entryId: string) => boolean,
): number {
  if (order.length === 0) return 0;
  let next = (currentIndex + 1) % order.length;
  for (let steps = 0; steps < order.length; steps++) {
    if (isAlive(order[next])) return next;
    next = (next + 1) % order.length;
  }
  return currentIndex;
}
