import { SHIPS } from './sea-battle.constants';

export function validateSeaBattleConfig(
  config: Record<string, unknown>,
): boolean {
  const gridSize = config.gridSize;
  if (gridSize !== undefined) {
    if (typeof gridSize !== 'number' || ![10, 15, 20].includes(gridSize)) {
      return false;
    }
  }

  const shipCount = config.shipCount;
  if (shipCount !== undefined) {
    if (typeof shipCount !== 'number' || shipCount < 3 || shipCount > 15) {
      return false;
    }
    if (gridSize !== undefined) {
      const totalShipCells = SHIPS.slice(0, shipCount).reduce(
        (sum, s) => sum + s.size,
        0,
      );
      const boardCells = gridSize * gridSize;
      if (totalShipCells > boardCells * 0.4) {
        return false;
      }
    }
  }

  const specialWeapons = config.specialWeapons;
  if (specialWeapons !== undefined) {
    if (typeof specialWeapons !== 'object' || specialWeapons === null) {
      return false;
    }
    const sw = specialWeapons as Record<string, unknown>;
    if (
      (sw.sonar !== undefined && typeof sw.sonar !== 'boolean') ||
      (sw.radar !== undefined && typeof sw.radar !== 'boolean')
    ) {
      return false;
    }
  }

  return true;
}
