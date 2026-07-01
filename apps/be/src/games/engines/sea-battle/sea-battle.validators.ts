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
  MoveShipPayload,
  AttackPayload,
} from './sea-battle.types';
import { areCellsValid, areCellsConnected } from './sea-battle.utils';
import {
  arePlayersOnSameTeam,
  getActiveShooterId,
} from './team-rotation.utils';

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
      const gSize = state.gridSize ?? BOARD_SIZE;
      if (r >= 0 && r < gSize && c >= 0 && c < gSize) {
        if (player.board[r][c] === CELL_STATE.SHIP) {
          return false;
        }
      }
    }
  }

  return true;
}

export function validateMoveShip(
  state: SeaBattleState,
  player: SeaBattlePlayer,
  payload: MoveShipPayload,
): boolean {
  if (state.phase !== GAME_PHASE.PLACEMENT) return false;
  if (player.placementComplete) return false;
  if (!payload?.shipId || !payload?.cells) return false;

  const shipConfig = SHIPS.find((s) => s.id === payload.shipId);
  if (!shipConfig) return false;
  if (payload.cells.length !== shipConfig.size) return false;

  // Ship must already be placed — that's what makes this a *move* and not a place.
  const existing = player.ships.find((s) => s.id === payload.shipId);
  if (!existing) return false;

  if (!areCellsValid(payload.cells)) return false;
  if (!areCellsConnected(payload.cells)) return false;

  // Clone the board and clear the moving ship's existing cells so the overlap
  // and adjacency checks treat the ship's current position as empty — otherwise
  // a one-cell nudge along the ship's own axis would always fail.
  const virtualBoard = player.board.map((row) => row.slice());
  for (const cell of existing.cells) {
    virtualBoard[cell.row][cell.col] = CELL_STATE.EMPTY;
  }

  for (const cell of payload.cells) {
    if (virtualBoard[cell.row][cell.col] !== CELL_STATE.EMPTY) {
      return false;
    }

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
      const gSize = state.gridSize ?? BOARD_SIZE;
      if (r >= 0 && r < gSize && c >= 0 && c < gSize) {
        if (virtualBoard[r][c] === CELL_STATE.SHIP) {
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

  // Determine who is allowed to attack right now.
  const activeId = state.teams
    ? getActiveShooterId(state)
    : state.playerOrder[state.currentTurnIndex];
  if (player.playerId !== activeId) return false;

  if (
    !payload?.targetPlayerId ||
    payload.row === undefined ||
    payload.col === undefined
  ) {
    return false;
  }

  if (payload.targetPlayerId === player.playerId) return false;

  // No friendly fire in team mode.
  if (
    state.teams &&
    arePlayersOnSameTeam(state, player.playerId, payload.targetPlayerId)
  ) {
    return false;
  }

  const target = state.players.find(
    (p) => p.playerId === payload.targetPlayerId,
  );
  if (!target || !target.alive) return false;

  if (
    payload.row < 0 ||
    payload.row >= (state.gridSize ?? BOARD_SIZE) ||
    payload.col < 0 ||
    payload.col >= (state.gridSize ?? BOARD_SIZE)
  ) {
    return false;
  }

  const cellState = target.board[payload.row][payload.col];
  if (cellState === CELL_STATE.HIT || cellState === CELL_STATE.MISS) {
    return false;
  }

  return true;
}
