import type { Cell, Point, StoneColor } from '../types';

type Board = Cell[][];

const ORTHOGONAL: ReadonlyArray<readonly [number, number]> = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

function isOnBoard(board: Board, row: number, col: number): boolean {
  return row >= 0 && row < board.length && col >= 0 && col < board.length;
}

export interface TerritoryPoint {
  row: number;
  col: number;
  owner: StoneColor | 'neutral';
}

/**
 * Flood-fill empty regions and determine ownership for territory display.
 * Returns a map of empty intersections to their territory owner.
 */
export function computeTerritory(board: Board): TerritoryPoint[] {
  const size = board.length;
  const visited = new Set<string>();
  const result: TerritoryPoint[] = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] !== null) continue;
      const key = `${row}:${col}`;
      if (visited.has(key)) continue;

      const region: Point[] = [];
      const stack: Point[] = [{ row, col }];
      visited.add(key);
      const borders = new Set<StoneColor>();

      while (stack.length > 0) {
        const p = stack.pop() as Point;
        region.push(p);
        for (const [dr, dc] of ORTHOGONAL) {
          const r = p.row + dr;
          const c = p.col + dc;
          if (!isOnBoard(board, r, c)) continue;
          const rk = `${r}:${c}`;
          const cell = board[r][c];
          if (cell === null) {
            if (!visited.has(rk)) {
              visited.add(rk);
              stack.push({ row: r, col: c });
            }
          } else {
            borders.add(cell);
          }
        }
      }

      const owner: StoneColor | 'neutral' =
        borders.size === 1 ? [...borders][0] : 'neutral';
      for (const p of region) {
        result.push({ row: p.row, col: p.col, owner });
      }
    }
  }

  return result;
}

export interface GroupInfo {
  stones: Point[];
  liberties: number;
}

/**
 * Find all groups on the board with their liberty counts.
 * Used for dead stone marking and territory display.
 */
export function findAllGroups(board: Board): GroupInfo[] {
  const size = board.length;
  const visited = new Set<string>();
  const groups: GroupInfo[] = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const color = board[row][col];
      if (!color) continue;
      const key = `${row}:${col}`;
      if (visited.has(key)) continue;

      const stones: Point[] = [];
      const liberties = new Set<string>();
      const stack: Point[] = [{ row, col }];
      visited.add(key);

      while (stack.length > 0) {
        const p = stack.pop() as Point;
        stones.push(p);
        for (const [dr, dc] of ORTHOGONAL) {
          const r = p.row + dr;
          const c = p.col + dc;
          if (!isOnBoard(board, r, c)) continue;
          const rk = `${r}:${c}`;
          const cell = board[r][c];
          if (cell === null) {
            liberties.add(rk);
          } else if (cell === color && !visited.has(rk)) {
            visited.add(rk);
            stack.push({ row: r, col: c });
          }
        }
      }

      groups.push({ stones, liberties: liberties.size });
    }
  }

  return groups;
}
