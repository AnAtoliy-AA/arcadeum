import { randomInt as secureRandomInt } from 'node:crypto';
import type { Cell, StoneColor } from './go.constants';
import type { BoardScores, Point } from './go.types';

export { secureRandomInt };

export function createEmptyBoard(size: number): Board {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null as Cell),
  );
}

/** In-place Fisher–Yates shuffle backed by a CSPRNG. */
export function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export type Board = Cell[][];

export function opponentOf(color: StoneColor): StoneColor {
  return color === 'black' ? 'white' : 'black';
}

export function isOnBoard(board: Board, row: number, col: number): boolean {
  return row >= 0 && row < board.length && col >= 0 && col < board.length;
}

const ORTHOGONAL: ReadonlyArray<readonly [number, number]> = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export interface Group {
  stones: Point[];
  liberties: Point[];
}

/** Flood-fill the group containing (row, col). Empty board cell → empty group. */
export function groupAt(board: Board, row: number, col: number): Group {
  const color = board[row]?.[col];
  if (!color) return { stones: [], liberties: [] };

  const visited = new Set<string>();
  const liberties = new Map<string, Point>();
  const stack: Point[] = [{ row, col }];
  const stones: Point[] = [];
  visited.add(`${row}:${col}`);

  while (stack.length > 0) {
    const point = stack.pop() as Point;
    stones.push(point);
    for (const [dr, dc] of ORTHOGONAL) {
      const r = point.row + dr;
      const c = point.col + dc;
      if (!isOnBoard(board, r, c)) continue;
      const key = `${r}:${c}`;
      if (visited.has(key)) continue;
      const cell = board[r][c];
      if (cell === null) {
        visited.add(key);
        liberties.set(key, { row: r, col: c });
      } else if (cell === color) {
        visited.add(key);
        stack.push({ row: r, col: c });
      }
    }
  }

  return { stones, liberties: [...liberties.values()] };
}

export interface MoveOutcome {
  board: Board;
  capturedStones: Point[];
  /** True when the placement leaves own group without liberties. */
  isSuicide: boolean;
  /** Simple-ko forbidden point for the opponent's next move (or null). */
  koPoint: Point | null;
  selfLibertiesAfter: number;
}

/**
 * Apply a stone placement to a copy of the board: remove captured opposing
 * groups and evaluate suicide / ko. Does NOT validate turn or occupancy.
 */
export function applyMove(
  board: Board,
  color: StoneColor,
  row: number,
  col: number,
): MoveOutcome {
  const next = board.map((r) => [...r]) as Board;
  next[row][col] = color;

  const enemy = opponentOf(color);
  const capturedStones: Point[] = [];
  const processedGroups = new Set<string>();

  for (const [dr, dc] of ORTHOGONAL) {
    const r = row + dr;
    const c = col + dc;
    if (!isOnBoard(next, r, c)) continue;
    if (next[r][c] !== enemy) continue;
    const key = `${r}:${c}`;
    if (processedGroups.has(key)) continue;
    const group = groupAt(next, r, c);
    for (const s of group.stones) processedGroups.add(`${s.row}:${s.col}`);
    if (group.liberties.length === 0) {
      for (const s of group.stones) {
        next[s.row][s.col] = null;
        capturedStones.push(s);
      }
    }
  }

  const own = groupAt(next, row, col);
  const isSuicide = own.liberties.length === 0;

  // Simple ko: a single stone was captured by a lone stone that now has
  // exactly one liberty — that liberty is the captured point itself.
  let koPoint: Point | null = null;
  if (
    capturedStones.length === 1 &&
    own.stones.length === 1 &&
    own.liberties.length === 1
  ) {
    koPoint = capturedStones[0];
  }

  return {
    board: next,
    capturedStones,
    isSuicide,
    koPoint,
    selfLibertiesAfter: own.liberties.length,
  };
}

export interface PlacementProbe {
  /** False when the placement would be suicide. */
  ok: boolean;
  capturedCount: number;
  koPoint: Point | null;
  selfLiberties: number;
}

/**
 * Evaluate a placement by mutating the board in place and reverting — avoids
 * the O(N²) board copy that applyMove performs for every candidate point.
 * Semantically equivalent to reading applyMove's outcome. When `commit` is
 * set, the board keeps the resulting position unless the move is suicide
 * (illegal), in which case every touched cell is reverted as well.
 */
export function probePlacement(
  board: Board,
  color: StoneColor,
  row: number,
  col: number,
  commit: boolean,
): PlacementProbe {
  const enemy = opponentOf(color);
  board[row][col] = color;

  const captured: Point[] = [];
  const processedGroups = new Set<string>();
  for (const [dr, dc] of ORTHOGONAL) {
    const r = row + dr;
    const c = col + dc;
    if (!isOnBoard(board, r, c)) continue;
    if (board[r][c] !== enemy) continue;
    const key = `${r}:${c}`;
    if (processedGroups.has(key)) continue;
    const group = groupAt(board, r, c);
    for (const s of group.stones) processedGroups.add(`${s.row}:${s.col}`);
    if (group.liberties.length === 0) {
      for (const s of group.stones) {
        board[s.row][s.col] = null;
        captured.push(s);
      }
    }
  }

  const own = groupAt(board, row, col);
  const selfLiberties = own.liberties.length;

  if (!commit || selfLiberties === 0) {
    board[row][col] = null;
    for (const s of captured) board[s.row][s.col] = enemy;
  }

  let koPoint: Point | null = null;
  if (captured.length === 1 && own.stones.length === 1 && selfLiberties === 1) {
    koPoint = captured[0];
  }

  return {
    ok: selfLiberties > 0,
    capturedCount: captured.length,
    koPoint,
    selfLiberties,
  };
}

export interface LegalMoveCheck {
  ok: boolean;
  reason?: 'occupied' | 'ko' | 'suicide';
}

export function checkMoveLegality(
  board: Board,
  color: StoneColor,
  row: number,
  col: number,
  koPoint: Point | null,
): LegalMoveCheck {
  if (!isOnBoard(board, row, col)) return { ok: false, reason: 'occupied' };
  if (board[row][col] !== null) return { ok: false, reason: 'occupied' };
  if (koPoint && koPoint.row === row && koPoint.col === col) {
    return { ok: false, reason: 'ko' };
  }
  const outcome = applyMove(board, color, row, col);
  if (outcome.isSuicide) return { ok: false, reason: 'suicide' };
  return { ok: true };
}

export function isLegalMove(
  board: Board,
  color: StoneColor,
  row: number,
  col: number,
  koPoint: Point | null,
): boolean {
  return checkMoveLegality(board, color, row, col, koPoint).ok;
}

export function getLegalMoves(
  board: Board,
  color: StoneColor,
  koPoint: Point | null,
): Point[] {
  const moves: Point[] = [];
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board.length; col++) {
      if (isLegalMove(board, color, row, col, koPoint))
        moves.push({ row, col });
    }
  }
  return moves;
}

/**
 * True eye approximation used by the bot/playouts: all orthogonal neighbours
 * are friendly and the diagonal control test passes (on edge/corner every
 * diagonal must be friendly; in the centre at most one hostile diagonal).
 */
export function isTrueEye(
  board: Board,
  color: StoneColor,
  row: number,
  col: number,
): boolean {
  if (board[row]?.[col] !== null) return false;
  const enemy = opponentOf(color);
  let friendlyOrthogonal = 0;
  for (const [dr, dc] of ORTHOGONAL) {
    const r = row + dr;
    const c = col + dc;
    if (!isOnBoard(board, r, c)) {
      friendlyOrthogonal++;
      continue;
    }
    if (board[r][c] === color) friendlyOrthogonal++;
  }
  if (friendlyOrthogonal !== 4) return false;

  const diagonals: Array<[number, number]> = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];
  let hostile = 0;
  let edge = false;
  for (const [dr, dc] of diagonals) {
    const r = row + dr;
    const c = col + dc;
    if (!isOnBoard(board, r, c)) {
      edge = true;
      continue;
    }
    if (board[r][c] === enemy) hostile++;
  }
  return edge ? hostile === 0 : hostile <= 1;
}

/**
 * Chinese area scoring: points controlled by each side.
 * Stones count for their owner; empty regions bordered exclusively by one
 * colour count for that colour; contested regions are neutral.
 */
export function scoreBoard(board: Board, komi: number): BoardScores {
  const size = board.length;
  let black = 0;
  let white = komi;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === 'black') black++;
      else if (board[row][col] === 'white') white++;
    }
  }

  const visited = new Set<string>();
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

      if (borders.size === 1) {
        if (borders.has('black')) black += region.length;
        else white += region.length;
      }
    }
  }

  return { black, white };
}
