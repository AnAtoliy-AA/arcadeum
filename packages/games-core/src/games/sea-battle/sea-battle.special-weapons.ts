import { BOARD_SIZE, CellState } from './sea-battle.constants';
import {
  SeaBattlePlayer,
  SeaBattleState,
  SonarPayload,
  RadarPayload,
} from './sea-battle.types';
import { GameActionResult } from '../../base/game-engine.interface';

function getSonarSide(gridSize: number): number {
  if (gridSize <= 10) return 3;
  if (gridSize <= 15) return 5;
  return 7;
}

function getRadarLines(gridSize: number): number {
  if (gridSize <= 10) return 1;
  if (gridSize <= 15) return 3;
  return 5;
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
  const side = getSonarSide(gSize);
  const cells: { row: number; col: number; state: CellState }[] = [];

  const rStart = centerRow - Math.floor((side - 1) / 2);
  const rEnd = rStart + side - 1;
  const cStart = centerCol - Math.floor((side - 1) / 2);
  const cEnd = cStart + side - 1;

  for (let r = rStart; r <= rEnd; r++) {
    for (let c = cStart; c <= cEnd; c++) {
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
    radius: Math.floor((side - 1) / 2),
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
  const lines = getRadarLines(gSize);
  const halfWidth = Math.floor(lines / 2);
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
