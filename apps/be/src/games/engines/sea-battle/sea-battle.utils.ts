import {
  BOARD_SIZE,
  CELL_STATE,
  CellState,
  GAME_PHASE,
  getActiveShips,
} from './sea-battle.constants';
import {
  ShipCell,
  SeaBattlePlayer,
  Ship,
  SeaBattleState,
} from './sea-battle.types';
import { getActiveShooterId } from './team-rotation.utils';

export function createEmptyBoard(size: number = BOARD_SIZE): CellState[][] {
  return Array.from(
    { length: size },
    () => Array(size).fill(CELL_STATE.EMPTY) as CellState[],
  );
}

export function areCellsValid(
  cells: ShipCell[],
  gridSize: number = BOARD_SIZE,
): boolean {
  return cells.every(
    (cell) =>
      cell.row >= 0 &&
      cell.row < gridSize &&
      cell.col >= 0 &&
      cell.col < gridSize,
  );
}

export function areCellsConnected(cells: ShipCell[]): boolean {
  if (cells.length <= 1) return true;

  const sorted = [...cells].sort((a, b) =>
    a.row === b.row ? a.col - b.col : a.row - b.row,
  );

  const isHorizontal = sorted.every((c) => c.row === sorted[0].row);
  const isVertical = sorted.every((c) => c.col === sorted[0].col);

  if (!isHorizontal && !isVertical) return false;

  for (let i = 1; i < sorted.length; i++) {
    if (isHorizontal) {
      if (sorted[i].col !== sorted[i - 1].col + 1) return false;
    } else {
      if (sorted[i].row !== sorted[i - 1].row + 1) return false;
    }
  }

  return true;
}

export function markSurroundingCellsAsMiss(
  player: SeaBattlePlayer,
  ship: Ship,
  gridSize: number = BOARD_SIZE,
): void {
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  for (const cell of ship.cells) {
    for (const [dr, dc] of directions) {
      const r = cell.row + dr;
      const c = cell.col + dc;

      if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
        if (player.board[r][c] === CELL_STATE.EMPTY) {
          player.board[r][c] = CELL_STATE.MISS;
        }
      }
    }
  }
}

export function sanitizeSeaBattleState(
  state: SeaBattleState,
  playerId: string,
): Partial<SeaBattleState> {
  // structuredClone is faster than JSON.parse/stringify and correctly handles
  // all nested types (Maps, Sets, typed arrays, etc.).
  const sanitized: SeaBattleState = structuredClone(state);

  // Build a viewer team membership Set once for O(1) lookups below.
  const viewerTeam = sanitized.teams?.find((t) =>
    t.playerIds.includes(playerId),
  );
  const viewerTeamId = viewerTeam?.id;
  const viewerTeamMemberSet: Set<string> = viewerTeam
    ? new Set(viewerTeam.playerIds)
    : new Set();

  // Build team-id lookup map for log filtering — avoids teams.find() per log.
  const playerTeamIdMap = new Map<string, string>();
  if (sanitized.teams) {
    for (const team of sanitized.teams) {
      for (const pid of team.playerIds) {
        playerTeamIdMap.set(pid, team.id);
      }
    }
  }

  for (const p of sanitized.players) {
    if (p.playerId === playerId) continue;

    const sameTeam = viewerTeamMemberSet.has(p.playerId);
    const reveal = sameTeam && sanitized.hideShipsFromTeammates !== true;

    if (!reveal) {
      const gSize = sanitized.gridSize ?? BOARD_SIZE;
      for (let row = 0; row < gSize; row++) {
        for (let col = 0; col < gSize; col++) {
          if (p.board[row][col] === CELL_STATE.SHIP) {
            p.board[row][col] = CELL_STATE.EMPTY;
          }
        }
      }
      p.ships = p.ships.map((ship: Ship) => ({
        ...ship,
        cells: ship.sunk ? ship.cells : [],
      }));
    }
  }

  sanitized.logs = sanitized.logs.filter((log) => {
    if (log.scope === 'private') {
      return log.senderId === playerId;
    }
    if (log.scope === 'team') {
      if (!viewerTeamId) return false;
      return playerTeamIdMap.get(log.senderId ?? '') === viewerTeamId;
    }
    return true;
  });

  const isPlaying = sanitized.players.some((p) => p.playerId === playerId);

  const isTeammateOf = (otherId: string): boolean =>
    !!viewerTeamId && playerTeamIdMap.get(otherId) === viewerTeamId;

  // Spectators (watchers not playing on an active opponent board) can see all superpower effects.
  // Active players only see sonar/radar if they are the attacker or a teammate of the attacker.
  if (
    isPlaying &&
    sanitized.lastSonar &&
    sanitized.lastSonar.attackerId !== playerId &&
    !isTeammateOf(sanitized.lastSonar.attackerId)
  ) {
    delete sanitized.lastSonar;
  }
  if (
    isPlaying &&
    sanitized.lastRadar &&
    sanitized.lastRadar.attackerId !== playerId &&
    !isTeammateOf(sanitized.lastRadar.attackerId)
  ) {
    delete sanitized.lastRadar;
  }

  if (sanitized.specialWeaponUsage) {
    const myUsage = sanitized.specialWeaponUsage[playerId];
    sanitized.specialWeaponUsage = myUsage ? { [playerId]: myUsage } : {};
  }

  return sanitized;
}

export function getSeaBattleAvailableActions(
  state: SeaBattleState,
  playerId: string,
): string[] {
  const player = state.players.find((p) => p.playerId === playerId);
  if (!player || !player.alive) return [];

  const actions: string[] = ['chat'];
  const activeShips = getActiveShips(state.shipCount);

  if (state.phase === GAME_PHASE.PLACEMENT) {
    if (!player.placementComplete) {
      if (player.ships.length < activeShips.length) {
        actions.push('placeShip');
      }
      if (player.ships.length === activeShips.length) {
        actions.push('confirmPlacement');
      }
      if (player.ships.length > 0) {
        actions.push('resetPlacement');
        actions.push('moveShip');
      }
    }
  }

  if (state.phase === GAME_PHASE.BATTLE) {
    const activeId = state.teams
      ? getActiveShooterId(state)
      : state.playerOrder[state.currentTurnIndex];
    if (playerId === activeId) {
      actions.push('attack');

      const usage = state.specialWeaponUsage?.[playerId];
      if (state.specialWeapons?.sonar && !usage?.sonarUsed) {
        actions.push('useSonar');
      }
      if (state.specialWeapons?.radar && !usage?.radarUsed) {
        actions.push('useRadar');
      }
    }
  }

  return actions;
}

function getShipCells(
  startRow: number,
  startCol: number,
  size: number,
  isVertical: boolean,
  gridSize: number = BOARD_SIZE,
): ShipCell[] | null {
  const cells: ShipCell[] = [];
  for (let i = 0; i < size; i++) {
    const row = isVertical ? startRow + i : startRow;
    const col = isVertical ? startCol : startCol + i;

    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
      return null;
    }
    cells.push({ row, col });
  }
  return cells;
}

export function randomlyPlaceShips(
  gridSize: number = BOARD_SIZE,
  shipCount?: number,
): Record<string, ShipCell[]> {
  const activeShips = getActiveShips(shipCount);
  const sortedShips = [...activeShips].sort((a, b) => b.size - a.size);

  const maxAttempts = Math.max(100, gridSize * gridSize);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const board = createEmptyBoard(gridSize);
    const placements: Record<string, ShipCell[]> = {};
    let failed = false;

    for (const ship of sortedShips) {
      const validPositions: ShipCell[][] = [];
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          for (const vertical of [true, false]) {
            const cells = getShipCells(r, c, ship.size, vertical, gridSize);
            if (cells && canPlaceShipOnBoard(board, cells, gridSize)) {
              validPositions.push(cells);
            }
          }
        }
      }

      if (validPositions.length === 0) {
        failed = true;
        break;
      }

      const chosen =
        validPositions[Math.floor(Math.random() * validPositions.length)];
      for (const cell of chosen) {
        board[cell.row][cell.col] = CELL_STATE.SHIP;
      }
      placements[ship.id] = chosen;
    }

    if (!failed) return placements;
  }

  return {};
}

function canPlaceShipOnBoard(
  board: CellState[][],
  cells: ShipCell[],
  gridSize: number,
): boolean {
  for (const cell of cells) {
    if (board[cell.row][cell.col] !== CELL_STATE.EMPTY) return false;

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
      const r = cell.row + dr;
      const c = cell.col + dc;
      if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
        if (board[r][c] === CELL_STATE.SHIP) return false;
      }
    }
  }
  return true;
}
