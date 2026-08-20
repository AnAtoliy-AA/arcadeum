import type { ShipCell, CellState } from '../../types';
import { CELL_STATE } from '../../types';

export function createEmptyBoard(size: number = 10): CellState[][] {
  return Array(size)
    .fill(null)
    .map(() => Array(size).fill(CELL_STATE.EMPTY));
}

export function getCellsForPlacement(
  startRow: number,
  startCol: number,
  size: number,
  isVertical: boolean,
  boardSize: number = 10,
): ShipCell[] | null {
  const cells: ShipCell[] = [];
  for (let i = 0; i < size; i++) {
    const row = isVertical ? startRow + i : startRow;
    const col = isVertical ? startCol : startCol + i;
    if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
      return null;
    }
    cells.push({ row, col });
  }
  return cells;
}
