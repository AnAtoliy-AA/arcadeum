import {
  BOARD_SIZE,
  CellState,
  GAME_MODE_VARIANTS,
  SPEED_TURN_BUDGET_MS,
} from './sea-battle.constants';
import {
  SeaBattlePlayer,
  SeaBattleState,
  SonarPayload,
  RadarPayload,
} from './sea-battle.types';
import { GameActionResult } from '../base/game-engine.interface';
import {
  advanceTeamRotationOnMiss,
  getActiveShooterId,
} from './team-rotation.utils';

const SONAR_RADIUS = 2;

export function executeSonar(
  state: SeaBattleState,
  player: SeaBattlePlayer,
  payload: SonarPayload,
): GameActionResult<SeaBattleState> {
  const target = state.players.find(
    (p) => p.playerId === payload.targetPlayerId,
  ) as SeaBattlePlayer;

  if (!state.specialWeaponUsage) {
    state.specialWeaponUsage = {};
  }
  if (!state.specialWeaponUsage[player.playerId]) {
    state.specialWeaponUsage[player.playerId] = {};
  }
  state.specialWeaponUsage[player.playerId].sonarUsed = true;

  const centerRow = payload.row!;
  const centerCol = payload.col!;

  const shipPositions = target.ships
    .filter((s) => !s.sunk)
    .flatMap((s) => s.cells)
    .filter(
      (c) =>
        Math.abs(c.row - centerRow) <= SONAR_RADIUS &&
        Math.abs(c.col - centerCol) <= SONAR_RADIUS,
    );

  state.lastSonar = {
    attackerId: player.playerId,
    targetId: target.playerId,
    centerRow,
    centerCol,
    radius: SONAR_RADIUS,
    shipPositions,
  };

  state.logs.push({
    id: `sonar-${Date.now()}`,
    type: 'action',
    message: `used sonar on area around row ${centerRow}, col ${centerCol}`,
    createdAt: new Date().toISOString(),
    senderId: player.playerId,
    targetId: target.playerId,
    kind: 'sb.sonar',
    scope: 'private',
  });

  advanceTurn(state);

  return { success: true, state };
}

export function executeRadar(
  state: SeaBattleState,
  player: SeaBattlePlayer,
  payload: RadarPayload,
): GameActionResult<SeaBattleState> {
  const target = state.players.find(
    (p) => p.playerId === payload.targetPlayerId,
  ) as SeaBattlePlayer;

  if (!state.specialWeaponUsage) {
    state.specialWeaponUsage = {};
  }
  if (!state.specialWeaponUsage[player.playerId]) {
    state.specialWeaponUsage[player.playerId] = {};
  }
  state.specialWeaponUsage[player.playerId].radarUsed = true;

  const gSize = state.gridSize ?? BOARD_SIZE;
  const cells: { row: number; col: number; state: CellState }[] = [];

  if (payload.row !== undefined) {
    for (let col = 0; col < gSize; col++) {
      cells.push({
        row: payload.row,
        col,
        state: target.board[payload.row][col],
      });
    }
  } else if (payload.col !== undefined) {
    for (let row = 0; row < gSize; row++) {
      cells.push({
        row,
        col: payload.col,
        state: target.board[row][payload.col],
      });
    }
  }

  state.lastRadar = {
    attackerId: player.playerId,
    targetId: target.playerId,
    row: payload.row,
    col: payload.col,
    cells,
  };

  state.logs.push({
    id: `radar-${Date.now()}`,
    type: 'action',
    message: 'used radar to scan the battlefield',
    createdAt: new Date().toISOString(),
    senderId: player.playerId,
    targetId: target.playerId,
    kind: 'sb.radar',
    scope: 'private',
  });

  advanceTurn(state);

  return { success: true, state };
}

function advanceTurn(state: SeaBattleState): void {
  if (state.teams) {
    advanceTeamRotationOnMiss(state);
    const shooter = getActiveShooterId(state);
    if (shooter) {
      state.currentTurnIndex = state.playerOrder.indexOf(shooter);
    }
  } else {
    const alivePlayers = state.players.filter((p) => p.alive);
    if (alivePlayers.length <= 1) return;

    let nextIndex = state.currentTurnIndex;
    do {
      nextIndex = (nextIndex + 1) % state.playerOrder.length;
      const nextPlayer = state.players.find(
        (p) => p.playerId === state.playerOrder[nextIndex],
      );
      if (nextPlayer?.alive) {
        state.currentTurnIndex = nextIndex;
        return;
      }
    } while (nextIndex !== state.currentTurnIndex);
  }

  state.roundNumber = (state.roundNumber ?? 1) + 1;

  if (state.mode === GAME_MODE_VARIANTS.SPEED) {
    const activePlayerId = state.teams
      ? getActiveShooterId(state)
      : state.playerOrder[state.currentTurnIndex];
    if (activePlayerId) {
      const speedPlayer = state.players.find(
        (p) => p.playerId === activePlayerId,
      );
      if (speedPlayer) {
        speedPlayer.turnDeadline = Date.now() + SPEED_TURN_BUDGET_MS;
      }
    }
  }
}
