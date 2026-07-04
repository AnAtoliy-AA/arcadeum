import type { ShipCell, CellState } from '../types';
import { CELL_STATE } from '../types';

export function getCells(
  row: number,
  col: number,
  size: number,
  vertical: boolean,
  boardSize: number = 10,
): ShipCell[] | null {
  const cells: ShipCell[] = [];
  for (let i = 0; i < size; i++) {
    const r = vertical ? row + i : row;
    const c = vertical ? col : col + i;
    if (r < 0 || r >= boardSize || c < 0 || c >= boardSize) return null;
    cells.push({ row: r, col: c });
  }
  return cells;
}

export function canPlace(cells: ShipCell[], board: CellState[][]): boolean {
  const boardSize = board.length || 10;
  for (const cell of cells) {
    if (board[cell.row]?.[cell.col] !== CELL_STATE.EMPTY) return false;
    const dirs = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];
    for (const [dr, dc] of dirs) {
      const r = cell.row + (dr ?? 0);
      const c = cell.col + (dc ?? 0);
      if (r >= 0 && r < boardSize && c >= 0 && c < boardSize) {
        if (board[r][c] === CELL_STATE.SHIP) return false;
      }
    }
  }
  return true;
}

export function cellsEqual(a: ShipCell[], b: ShipCell[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].row !== b[i].row || a[i].col !== b[i].col) return false;
  }
  return true;
}
