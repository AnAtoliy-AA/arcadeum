import {
  BOARD_SIZE,
  CELL_STATE,
  SHIPS,
  GAME_PHASE,
} from './sea-battle.constants';
import {
  SeaBattlePlayer,
  SeaBattleState,
  PlaceShipPayload,
  AttackPayload,
} from './sea-battle.types';
import { areCellsValid, areCellsConnected } from './sea-battle.utils';

export function validatePlaceShip(
  state: SeaBattleState,
  player: SeaBattlePlayer,
  payload: PlaceShipPayload,
): boolean {
  if (state.phase !== GAME_PHASE.PLACEMENT) return false;
  if (player.placementComplete) return false;
  if (!payload?.shipId || !payload?.cells) return false;

  const shipConfig = SHIPS.find((s) => s.id === payload.shipId);
  if (!shipConfig) return false;
  if (payload.cells.length !== shipConfig.size) return false;

  // Check if ship already placed
  if (player.ships.some((s) => s.id === payload.shipId)) return false;

  // Check cells are valid and connected
  if (!areCellsValid(payload.cells)) return false;
  if (!areCellsConnected(payload.cells)) return false;

  // Check cells don't overlap with existing ships AND are not adjacent
  for (const cell of payload.cells) {
    if (player.board[cell.row][cell.col] !== CELL_STATE.EMPTY) {
      return false;
    }

    // Check surrounding cells
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

    for (const [dr, dc] of directions) {
      const r = cell.row + dr;
      const c = cell.col + dc;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        if (player.board[r][c] === CELL_STATE.SHIP) {
          return false;
        }
      }
    }
  }

  return true;
}

export function validateConfirmPlacement(
  state: SeaBattleState,
  player: SeaBattlePlayer,
): boolean {
  if (state.phase !== GAME_PHASE.PLACEMENT) return false;
  if (player.placementComplete) return false;
  return player.ships.length === SHIPS.length;
}

export function validateAutoPlace(state: SeaBattleState): boolean {
  if (state.phase !== GAME_PHASE.PLACEMENT) return false;
  // Auto place relies on the fact that we can reset and re-place
  return true;
}

export function validateResetPlacement(
  state: SeaBattleState,
  player: SeaBattlePlayer,
): boolean {
  if (state.phase !== GAME_PHASE.PLACEMENT) return false;
  if (player.placementComplete) return false;
  return true;
}

export function validateAttack(
  state: SeaBattleState,
  player: SeaBattlePlayer,
  payload: AttackPayload,
): boolean {
  if (state.phase !== GAME_PHASE.BATTLE) return false;

  const currentPlayerId = state.playerOrder[state.currentTurnIndex];
  if (player.playerId !== currentPlayerId) return false;

  if (
    !payload?.targetPlayerId ||
    payload.row === undefined ||
    payload.col === undefined
  ) {
    return false;
  }

  if (payload.targetPlayerId === player.playerId) return false;

  const target = state.players.find(
    (p) => p.playerId === payload.targetPlayerId,
  );
  if (!target || !target.alive) return false;

  if (
    payload.row < 0 ||
    payload.row >= BOARD_SIZE ||
    payload.col < 0 ||
    payload.col >= BOARD_SIZE
  ) {
    return false;
  }

  const cellState = target.board[payload.row][payload.col];
  if (cellState === CELL_STATE.HIT || cellState === CELL_STATE.MISS) {
    return false;
  }

  return true;
}
