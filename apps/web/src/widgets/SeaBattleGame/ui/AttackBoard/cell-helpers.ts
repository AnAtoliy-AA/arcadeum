import { CELL_STATE } from '../../types';
import type { SeaBattleTheme } from '../../lib/theme';

export function getCellBg(state: number, theme: SeaBattleTheme): string {
  switch (state) {
    case CELL_STATE.HIT:
      return theme.hitColor;
    case CELL_STATE.MISS:
      return theme.missColor;
    case CELL_STATE.SHIP:
      return theme.shipColor;
    default:
      return theme.cellEmpty;
  }
}

export function getCellIcon(isSunk: boolean, cellState: number): string | null {
  if (isSunk) return '💀';
  if (cellState === CELL_STATE.HIT) return '🔥';
  return null;
}

export function getCellAnimClass(
  isSunk: boolean,
  cellState: number,
): string | undefined {
  if (isSunk) return 'sb-glow-sunk';
  if (cellState === CELL_STATE.HIT) return 'sb-glow-hit';
  return undefined;
}
