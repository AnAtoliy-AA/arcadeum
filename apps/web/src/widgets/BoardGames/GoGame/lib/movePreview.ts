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

function opponentOf(color: StoneColor): StoneColor {
  return color === 'black' ? 'white' : 'black';
}

interface Group {
  stones: Point[];
  liberties: Point[];
}

function groupAt(board: Board, row: number, col: number): Group {
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

export interface MovePreview {
  capturedStones: number;
  isSelfCapture: boolean;
  selfLiberties: number;
}

export function previewMove(
  board: Board,
  color: StoneColor,
  row: number,
  col: number,
): MovePreview {
  if (!isOnBoard(board, row, col) || board[row][col] !== null) {
    return { capturedStones: 0, isSelfCapture: false, selfLiberties: 0 };
  }

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
  const selfLiberties = own.liberties.length;

  return {
    capturedStones: capturedStones.length,
    isSelfCapture: selfLiberties === 0,
    selfLiberties,
  };
}
