import type { CellValue, WinLineCell } from './tic-tac-toe.types';

export function createEmptyBoard(rows: number, cols?: number): CellValue[][] {
  const c = cols ?? rows;
  return Array.from({ length: rows }, () =>
    Array.from({ length: c }, () => null as CellValue),
  );
}

export interface ExpandResult {
  board: CellValue[][];
  originDelta: { row: number; col: number };
}

export function expandBoard(
  board: CellValue[][],
  row: number,
  col: number,
  margin: number,
): ExpandResult {
  const rows = board.length;
  const cols = board[0]?.length ?? rows;
  let neededTop = 0;
  let neededBottom = 0;
  let neededLeft = 0;
  let neededRight = 0;

  if (row < margin) neededTop = margin - row;
  if (row >= rows - margin) neededBottom = margin - (rows - 1 - row);
  if (col < margin) neededLeft = margin - col;
  if (col >= cols - margin) neededRight = margin - (cols - 1 - col);

  if (
    neededTop === 0 &&
    neededBottom === 0 &&
    neededLeft === 0 &&
    neededRight === 0
  ) {
    return { board, originDelta: { row: 0, col: 0 } };
  }

  const newRows = rows + neededTop + neededBottom;
  const newCols = cols + neededLeft + neededRight;
  const newBoard = createEmptyBoard(newRows, newCols);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      newBoard[r + neededTop][c + neededLeft] = board[r][c];
    }
  }

  return {
    board: newBoard,
    originDelta: { row: neededTop, col: neededLeft },
  };
}

export function centeredToIndex(
  centered: { row: number; col: number },
  origin: { row: number; col: number },
): { row: number; col: number } {
  return {
    row: centered.row + origin.row,
    col: centered.col + origin.col,
  };
}

export function indexToCentered(
  index: { row: number; col: number },
  origin: { row: number; col: number },
): { row: number; col: number } {
  return {
    row: index.row - origin.row,
    col: index.col - origin.col,
  };
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
  const rows = board.length;
  const cols = board[0]?.length ?? rows;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (board[row][col] !== owner) continue;
      for (const [dRow, dCol] of DIRECTIONS) {
        const endRow = row + dRow * (winLength - 1);
        const endCol = col + dCol * (winLength - 1);
        if (endRow < 0 || endRow >= rows || endCol < 0 || endCol >= cols) {
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
