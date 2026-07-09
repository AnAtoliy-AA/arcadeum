import { BOARD_SIZE, CellState } from './sea-battle.constants';
import {
  SeaBattlePlayer,
  SeaBattleState,
  SonarPayload,
  RadarPayload,
} from './sea-battle.types';
import { GameActionResult } from '../base/game-engine.interface';

const SONAR_RADIUS = 1;

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

  const gSize = state.gridSize ?? BOARD_SIZE;
  const cells: { row: number; col: number; state: CellState }[] = [];

  for (let r = centerRow - SONAR_RADIUS; r <= centerRow + SONAR_RADIUS; r++) {
    for (let c = centerCol - SONAR_RADIUS; c <= centerCol + SONAR_RADIUS; c++) {
      if (r >= 0 && r < gSize && c >= 0 && c < gSize) {
        cells.push({ row: r, col: c, state: target.board[r][c] });
      }
    }
  }

  state.lastSonar = {
    attackerId: player.playerId,
    targetId: target.playerId,
    centerRow,
    centerCol,
    radius: SONAR_RADIUS,
    cells,
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

  return { success: true, state };
}
