import {
  SHIPS,
  getDefaultShipCount,
  getShipCountOptions,
} from './sea-battle.constants';

export function validateSeaBattleConfig(
  config: Record<string, unknown>,
): boolean {
  const gridSize = config.gridSize;
  if (gridSize !== undefined) {
    if (typeof gridSize !== 'number' || ![10, 15, 20].includes(gridSize)) {
      return false;
    }
  }

  const resolvedGridSize = typeof gridSize === 'number' ? gridSize : 10;
  const shipCount = config.shipCount ?? getDefaultShipCount(resolvedGridSize);
  const validCounts = getShipCountOptions(resolvedGridSize);

  if (typeof shipCount !== 'number' || !validCounts.includes(shipCount)) {
    return false;
  }

  const totalShipCells = SHIPS.slice(0, shipCount).reduce(
    (sum, s) => sum + s.size,
    0,
  );
  const boardCells = resolvedGridSize * resolvedGridSize;
  if (totalShipCells > boardCells * 0.4) {
    return false;
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
