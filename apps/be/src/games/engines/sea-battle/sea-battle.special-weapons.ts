import { BOARD_SIZE, CellState } from './sea-battle.constants';
import {
  SeaBattlePlayer,
  SeaBattleState,
  SonarPayload,
  RadarPayload,
} from './sea-battle.types';
import { GameActionResult } from '../base/game-engine.interface';

function getSonarRadius(gridSize: number): number {
  return Math.floor(gridSize / 3);
}

function getRadarHalfWidth(gridSize: number): number {
  return Math.floor(gridSize / 7);
}

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
  const radius = getSonarRadius(gSize);
  const cells: { row: number; col: number; state: CellState }[] = [];

  for (let r = centerRow - radius; r <= centerRow + radius; r++) {
    for (let c = centerCol - radius; c <= centerCol + radius; c++) {
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
    radius,
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
  const halfWidth = getRadarHalfWidth(gSize);
  const cells: { row: number; col: number; state: CellState }[] = [];

  if (payload.row !== undefined) {
    for (let dr = -halfWidth; dr <= halfWidth; dr++) {
      const r = payload.row + dr;
      if (r < 0 || r >= gSize) continue;
      for (let col = 0; col < gSize; col++) {
        cells.push({
          row: r,
          col,
          state: target.board[r][col],
        });
      }
    }
  } else if (payload.col !== undefined) {
    for (let dc = -halfWidth; dc <= halfWidth; dc++) {
      const c = payload.col + dc;
      if (c < 0 || c >= gSize) continue;
      for (let row = 0; row < gSize; row++) {
        cells.push({
          row,
          col: c,
          state: target.board[row][c],
        });
      }
    }
  }

  state.lastRadar = {
    attackerId: player.playerId,
    targetId: target.playerId,
    row: payload.row,
    col: payload.col,
    halfWidth,
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
