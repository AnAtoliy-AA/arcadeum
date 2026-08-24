import type { SeaBattlePlayer } from './sea-battle.types';
import {
  CELL_STATE,
  BOARD_SIZE,
} from './sea-battle.constants';

export function getSmartTarget(
  target: SeaBattlePlayer,
  gridSize: number = BOARD_SIZE,
): { r: number; c: number } | null {
  // Cells of already-sunk ships are public info; exclude them so we focus
  // on hits that still belong to damaged-but-unsunk ships.
  const sunkCells = new Set<string>();
  for (const ship of target.ships) {
    if (!ship.sunk) continue;
    for (const cell of ship.cells) {
      sunkCells.add(`${cell.row},${cell.col}`);
    }
  }

  const activeHits: { row: number; col: number }[] = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (target.board[r][c] !== CELL_STATE.HIT) continue;
      if (sunkCells.has(`${r},${c}`)) continue;
      activeHits.push({ row: r, col: c });
    }
  }

  if (activeHits.length === 0) return null;

  const isOpen = (r: number, c: number): boolean => {
    if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return false;
    const cell = target.board[r][c];
    return cell !== CELL_STATE.HIT && cell !== CELL_STATE.MISS;
  };

  // Line mode: if two adjacent active hits sit in a line (e.g. d3+d4),
  // extend the line from either endpoint (d2 or d5).
  const activeSet = new Set(activeHits.map((h) => `${h.row},${h.col}`));
  const lineCandidates = new Map<string, { r: number; c: number }>();
  const axes: [number, number][] = [
    [0, 1],
    [1, 0],
  ];

  for (const hit of activeHits) {
    for (const [dr, dc] of axes) {
      if (!activeSet.has(`${hit.row + dr},${hit.col + dc}`)) continue;

      // Walk forward to the far end of the line.
      let fr = hit.row;
      let fc = hit.col;
      while (activeSet.has(`${fr + dr},${fc + dc}`)) {
        fr += dr;
        fc += dc;
      }
      if (isOpen(fr + dr, fc + dc)) {
        lineCandidates.set(`${fr + dr},${fc + dc}`, {
          r: fr + dr,
          c: fc + dc,
        });
      }

      // Walk backward to the near end of the line.
      let br = hit.row;
      let bc = hit.col;
      while (activeSet.has(`${br - dr},${bc - dc}`)) {
        br -= dr;
        bc -= dc;
      }
      if (isOpen(br - dr, bc - dc)) {
        lineCandidates.set(`${br - dr},${bc - dc}`, {
          r: br - dr,
          c: bc - dc,
        });
      }
    }
  }

  if (lineCandidates.size > 0) {
    const arr = Array.from(lineCandidates.values());
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Single-hit mode: probe a random orthogonal neighbour of any active hit.
  const neighbours = new Map<string, { r: number; c: number }>();
  const directions: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (const hit of activeHits) {
    for (const [dr, dc] of directions) {
      const nr = hit.row + dr;
      const nc = hit.col + dc;
      if (!isOpen(nr, nc)) continue;
      neighbours.set(`${nr},${nc}`, { r: nr, c: nc });
    }
  }

  if (neighbours.size === 0) return null;
  const arr = Array.from(neighbours.values());
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getProbabilisticTarget(
  target: SeaBattlePlayer,
  gridSize: number = BOARD_SIZE,
): { r: number; c: number } | null {
  const sunkCells = new Set<string>();
  const remainingShipSizes: number[] = [];
  for (const ship of target.ships) {
    if (ship.sunk) {
      for (const cell of ship.cells) {
        sunkCells.add(`${cell.row},${cell.col}`);
      }
    } else if (ship.hits === 0) {
      remainingShipSizes.push(ship.size);
    }
  }

  if (remainingShipSizes.length === 0) return null;

  const density: number[][] = Array.from({ length: gridSize }, () =>
    Array<number>(gridSize).fill(0),
  );

  const isAvailable = (r: number, c: number): boolean => {
    if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return false;
    const cell = target.board[r][c];
    return (
      cell !== CELL_STATE.HIT &&
      cell !== CELL_STATE.MISS &&
      !sunkCells.has(`${r},${c}`)
    );
  };

  for (const size of remainingShipSizes) {
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Horizontal placement
        if (c + size <= gridSize) {
          let valid = true;
          for (let k = 0; k < size; k++) {
            if (!isAvailable(r, c + k)) {
              valid = false;
              break;
            }
          }
          if (valid) {
            for (let k = 0; k < size; k++) {
              density[r][c + k]++;
            }
          }
        }
        // Vertical placement
        if (r + size <= gridSize) {
          let valid = true;
          for (let k = 0; k < size; k++) {
            if (!isAvailable(r + k, c)) {
              valid = false;
              break;
            }
          }
          if (valid) {
            for (let k = 0; k < size; k++) {
              density[r + k][c]++;
            }
          }
        }
      }
    }
  }

  let maxDensity = 0;
  let candidates: { r: number; c: number }[] = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (!isAvailable(r, c)) continue;
      if (density[r][c] > maxDensity) {
        maxDensity = density[r][c];
        candidates = [{ r, c }];
      } else if (density[r][c] === maxDensity) {
        candidates.push({ r, c });
      }
    }
  }

  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
