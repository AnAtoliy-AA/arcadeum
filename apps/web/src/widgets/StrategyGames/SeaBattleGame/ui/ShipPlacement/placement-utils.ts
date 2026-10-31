import { randomlyPlaceShips } from '@arcadeum/games-core/games/sea-battle/sea-battle.utils';
import type { ShipCell, CellState, Ship } from '../../types';
import { CELL_STATE, getActiveShips } from '../../types';

export function createEmptyBoard(size: number = 10): CellState[][] {
  return Array(size)
    .fill(null)
    .map(() => Array(size).fill(CELL_STATE.EMPTY));
}

export function deriveBoard(
  localShips: Ship[],
  boardSize: number,
): CellState[][] {
  const next = createEmptyBoard(boardSize);
  for (const ship of localShips) {
    for (const c of ship.cells) {
      if (next[c.row]?.[c.col] !== undefined) {
        next[c.row][c.col] = CELL_STATE.SHIP;
      }
    }
  }
  return next;
}

export function areShipsEqual(a: Ship[], b: Ship[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every((shipA) => {
    const shipB = b.find((s) => s.id === shipA.id);
    if (!shipB || shipB.cells.length !== shipA.cells.length) return false;
    return shipA.cells.every((cA) =>
      shipB.cells.some((cB) => cA.row === cB.row && cA.col === cB.col),
    );
  });
}

export function generateAutoPlacedShips(
  boardSize: number = 10,
  shipCount?: number,
): Ship[] {
  const activeShips = getActiveShips(shipCount);
  const placements = randomlyPlaceShips(boardSize, shipCount);
  const activeShipMap = new Map(activeShips.map((s) => [s.id, s]));
  const ships: Ship[] = [];
  for (const shipId of Object.keys(placements)) {
    const cells = placements[shipId];
    const shipConfig = activeShipMap.get(shipId);
    if (shipConfig && cells) {
      ships.push({
        id: shipId,
        name: shipConfig.name,
        size: shipConfig.size,
        cells,
        hits: 0,
        sunk: false,
      });
    }
  }
  return ships;
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
