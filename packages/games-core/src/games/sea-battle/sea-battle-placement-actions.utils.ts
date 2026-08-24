import { createLogger } from '../../lib/logger';
import { randomUUID } from '../../lib/random';
import {
  BOARD_SIZE,
  CELL_STATE,
  GAME_PHASE,
  getActiveShips,
  type ShipConfig,
} from './sea-battle.constants';
import {
  Ship,
  SeaBattlePlayer,
  SeaBattleState,
  PlaceShipPayload,
  MoveShipPayload,
  BatchPlacementPayload,
} from './sea-battle.types';

function maybeBuildScanWave(state: SeaBattleState): void {
  if (!state.specialWeapons?.revealAll) return;
  const duration = (state.revealAllDuration as number | undefined) ?? 1;
  state.lastScanWave = {
    cells: state.players.map((p) => ({
      playerId: p.playerId,
      board: p.board,
    })),
    duration,
  };
}
import { randomlyPlaceShips } from './sea-battle.utils';
import type {
  GameActionResult,
  GameLogEntry,
} from '../../base/game-engine.interface';

const placementLogger = createLogger('SeaBattlePlacement');

function makeLog(
  type: 'system' | 'action' | 'message',
  message: string,
  opts?: { scope?: GameLogEntry['scope']; senderId?: string },
): GameLogEntry {
  return {
    id: randomUUID(),
    type,
    message,
    createdAt: new Date().toISOString(),
    scope: opts?.scope ?? 'all',
    senderId: opts?.senderId ?? null,
    senderName: null,
  };
}

export function runPlaceShip(
  state: SeaBattleState,
  player: SeaBattlePlayer,
  payload: PlaceShipPayload,
): GameActionResult<SeaBattleState> {
  const activeShips = getActiveShips(state.shipCount);
  const shipConfig = activeShips.find(
    (s) => s.id === payload.shipId,
  ) as ShipConfig;
  const ship: Ship = {
    id: payload.shipId,
    name: shipConfig.name,
    size: shipConfig.size,
    cells: payload.cells,
    hits: 0,
    sunk: false,
  };
  player.ships.push(ship);
  for (const cell of payload.cells) {
    player.board[cell.row][cell.col] = CELL_STATE.SHIP;
  }
  state.logs.push(
    makeLog('action', `Placed ${ship.name}`, {
      scope: 'private',
      senderId: player.playerId,
    }),
  );
  return { success: true, state };
}

export function runMoveShip(
  state: SeaBattleState,
  player: SeaBattlePlayer,
  payload: MoveShipPayload,
): GameActionResult<SeaBattleState> {
  const existing = player.ships.find((s) => s.id === payload.shipId);
  if (!existing) {
    return { success: false, error: 'Ship is not currently placed' };
  }

  for (const cell of existing.cells) {
    player.board[cell.row][cell.col] = CELL_STATE.EMPTY;
  }
  player.ships = player.ships.filter((s) => s.id !== payload.shipId);

  const activeShips = getActiveShips(state.shipCount);
  const shipConfig = activeShips.find(
    (s) => s.id === payload.shipId,
  ) as ShipConfig;
  const ship: Ship = {
    id: payload.shipId,
    name: shipConfig.name,
    size: shipConfig.size,
    cells: payload.cells,
    hits: 0,
    sunk: false,
  };
  player.ships.push(ship);
  for (const cell of payload.cells) {
    player.board[cell.row][cell.col] = CELL_STATE.SHIP;
  }

  state.logs.push(
    makeLog('action', `Moved ${ship.name}`, {
      scope: 'private',
      senderId: player.playerId,
    }),
  );
  return { success: true, state };
}

export function runAutoPlace(
  state: SeaBattleState,
  player: SeaBattlePlayer,
): GameActionResult<SeaBattleState> {
  const gridSize = state.gridSize ?? BOARD_SIZE;
  const activeShips = getActiveShips(state.shipCount);

  const placements = randomlyPlaceShips(gridSize, state.shipCount);
  if (Object.keys(placements).length === 0) {
    return { success: false, error: 'Failed to generate ship placement' };
  }

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (player.board[r][c] === CELL_STATE.SHIP) {
        player.board[r][c] = CELL_STATE.EMPTY;
      }
    }
  }
  player.ships = [];
  player.placementComplete = false;

  // Pre-build Map to avoid O(N) activeShips.find() per ship entry.
  const activeShipMap = new Map(activeShips.map((s) => [s.id, s]));
  for (const shipId of Object.keys(placements)) {
    const cells = placements[shipId];
    const shipConfig = activeShipMap.get(shipId);
    if (shipConfig) {
      const ship: Ship = {
        id: shipId,
        name: shipConfig.name,
        size: shipConfig.size,
        cells,
        hits: 0,
        sunk: false,
      };
      player.ships.push(ship);
      for (const cell of cells) {
        player.board[cell.row][cell.col] = CELL_STATE.SHIP;
      }
    }
  }
  state.logs.push(
    makeLog('action', 'Auto-placed ships', {
      scope: 'private',
      senderId: player.playerId,
    }),
  );
  return { success: true, state };
}

export function runConfirmPlacement(
  state: SeaBattleState,
  player: SeaBattlePlayer,
): GameActionResult<SeaBattleState> {
  player.placementComplete = true;
  state.logs.push(
    makeLog('system', 'finished placing ships', {
      senderId: player.playerId,
    }),
  );
  const allReady = state.players.every((p) => p.placementComplete);
  if (allReady) {
    state.phase = GAME_PHASE.BATTLE;
    maybeBuildScanWave(state);
    state.logs.push(makeLog('system', 'All ships placed! Battle begins!'));
  } else {
    const readyCount = state.players.reduce(
      (n, p) => n + (p.placementComplete ? 1 : 0),
      0,
    );
    placementLogger.debug(
      `Player ${player.playerId} confirmed. Ready: ${readyCount}/${state.players.length}`,
    );
  }
  return { success: true, state };
}

export function runResetPlacement(
  state: SeaBattleState,
  player: SeaBattlePlayer,
): GameActionResult<SeaBattleState> {
  const gridSize = state.gridSize ?? BOARD_SIZE;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (player.board[r][c] === CELL_STATE.SHIP) {
        player.board[r][c] = CELL_STATE.EMPTY;
      }
    }
  }
  player.ships = [];
  player.placementComplete = false;
  state.logs.push(
    makeLog('action', 'Reset ship placement', {
      scope: 'private',
      senderId: player.playerId,
    }),
  );
  return { success: true, state };
}

export function runBatchPlacement(
  state: SeaBattleState,
  player: SeaBattlePlayer,
  payload: BatchPlacementPayload,
): GameActionResult<SeaBattleState> {
  const gridSize = state.gridSize ?? BOARD_SIZE;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (player.board[r][c] === CELL_STATE.SHIP) {
        player.board[r][c] = CELL_STATE.EMPTY;
      }
    }
  }
  player.ships = [];

  // Pre-build Map to avoid O(N) activeShips.find() per ship entry.
  const activeShips = getActiveShips(state.shipCount);
  const activeShipMap = new Map(activeShips.map((s) => [s.id, s]));
  for (const shipData of payload.ships) {
    const shipConfig = activeShipMap.get(shipData.shipId);
    if (shipConfig) {
      const ship: Ship = {
        id: shipData.shipId,
        name: shipConfig.name,
        size: shipConfig.size,
        cells: shipData.cells,
        hits: 0,
        sunk: false,
      };
      player.ships.push(ship);
      for (const cell of shipData.cells) {
        player.board[cell.row][cell.col] = CELL_STATE.SHIP;
      }
    }
  }

  player.placementComplete = true;
  state.logs.push(
    makeLog('action', 'Placed all ships', {
      scope: 'private',
      senderId: player.playerId,
    }),
  );
  state.logs.push(
    makeLog('system', 'finished placing ships', {
      senderId: player.playerId,
    }),
  );

  const allReady = state.players.every((p) => p.placementComplete);
  if (allReady) {
    state.phase = GAME_PHASE.BATTLE;
    maybeBuildScanWave(state);
    state.logs.push(makeLog('system', 'All ships placed! Battle begins!'));
  }

  return { success: true, state };
}
