import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';
import {
  BOARD_SIZE,
  CELL_STATE,
  SHIPS,
  GAME_PHASE,
  type ShipConfig,
} from './sea-battle.constants';
import {
  Ship,
  SeaBattlePlayer,
  SeaBattleState,
  PlaceShipPayload,
} from './sea-battle.types';
import { randomlyPlaceShips } from './sea-battle.utils';
import type {
  GameActionResult,
  GameLogEntry,
} from '../base/game-engine.interface';

const placementLogger = new Logger('SeaBattlePlacement');

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
  const shipConfig = SHIPS.find((s) => s.id === payload.shipId) as ShipConfig;
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

export function runAutoPlace(
  state: SeaBattleState,
  player: SeaBattlePlayer,
): GameActionResult<SeaBattleState> {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (player.board[r][c] === CELL_STATE.SHIP) {
        player.board[r][c] = CELL_STATE.EMPTY;
      }
    }
  }
  player.ships = [];
  player.placementComplete = false;
  const placements = randomlyPlaceShips();
  if (Object.keys(placements).length === 0) {
    return { success: false, error: 'Failed to generate ship placement' };
  }
  for (const shipId of Object.keys(placements)) {
    const cells = placements[shipId];
    const shipConfig = SHIPS.find((s) => s.id === shipId);
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
    state.logs.push(makeLog('system', 'All ships placed! Battle begins!'));
  } else {
    const readyCount = state.players.filter((p) => p.placementComplete).length;
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
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
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
