import type { CellValue, WinLineCell } from './tic-tac-toe.types';

export function createEmptyBoard(size: number): CellValue[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null as CellValue),
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
  const size = board.length;
  let neededTop = 0;
  let neededBottom = 0;
  let neededLeft = 0;
  let neededRight = 0;

  if (row < margin) neededTop = margin - row;
  if (row >= size - margin) neededBottom = margin - (size - 1 - row);
  if (col < margin) neededLeft = margin - col;
  if (col >= size - margin) neededRight = margin - (size - 1 - col);

  if (
    neededTop === 0 &&
    neededBottom === 0 &&
    neededLeft === 0 &&
    neededRight === 0
  ) {
    return { board, originDelta: { row: 0, col: 0 } };
  }

  const totalNewRows =
    neededTop + neededBottom === 0
      ? 0
      : neededTop + neededBottom + ((neededTop + neededBottom) % 2);
  const totalNewCols =
    neededLeft + neededRight === 0
      ? 0
      : neededLeft + neededRight + ((neededLeft + neededRight) % 2);
  const newRowsTop = totalNewRows / 2;
  const newColsLeft = totalNewCols / 2;

  const newSize = size + totalNewRows + totalNewCols;
  const newBoard = createEmptyBoard(newSize);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      newBoard[r + newRowsTop][c + newColsLeft] = board[r][c];
    }
  }

  return {
    board: newBoard,
    originDelta: { row: newRowsTop, col: newColsLeft },
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
