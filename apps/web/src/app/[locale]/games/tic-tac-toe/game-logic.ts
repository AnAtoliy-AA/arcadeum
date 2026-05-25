export type BoardSize = 3 | 5 | 7 | 9;
export type Cell = 'X' | 'O' | null;
export type Board = Cell[];

export const BOARD_SIZES: readonly BoardSize[] = [3, 5, 7, 9] as const;

export function winLengthFor(size: BoardSize): number {
  switch (size) {
    case 3:
      return 3;
    case 5:
      return 4;
    default:
      return 5;
  }
}

export function createEmptyBoard(size: BoardSize): Board {
  return new Array(size * size).fill(null);
}

export interface WinResult {
  winner: Exclude<Cell, null>;
  line: number[];
}

// Directions: right, down, down-right, down-left.
const DIRECTIONS: readonly [number, number][] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

export function checkWinner(
  board: Board,
  size: BoardSize,
  winLength: number,
): WinResult | null {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const startIdx = row * size + col;
      const player = board[startIdx];
      if (!player) continue;

      for (const [dr, dc] of DIRECTIONS) {
        const endRow = row + dr * (winLength - 1);
        const endCol = col + dc * (winLength - 1);
        if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) {
          continue;
        }

        const line: number[] = [];
        let matched = true;
        for (let step = 0; step < winLength; step++) {
          const r = row + dr * step;
          const c = col + dc * step;
          const idx = r * size + c;
          if (board[idx] !== player) {
            matched = false;
            break;
          }
          line.push(idx);
        }

        if (matched) {
          return { winner: player, line };
        }
      }
    }
  }
  return null;
}

export function isDraw(board: Board, winner: WinResult | null): boolean {
  if (winner) return false;
  return board.every((c) => c !== null);
}
