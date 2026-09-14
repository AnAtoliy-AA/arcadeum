import { randomUUID } from '../../lib/random';
import {
  CELL_STATE,
  GAME_PHASE,
  SHIP_ABILITIES,
  ROW_LABELS,
  COL_LABELS,
  type CellState,
} from './sea-battle.constants';
import {
  SeaBattlePlayer,
  SeaBattleState,
} from './sea-battle.types';
import type {
  GameActionResult,
  GameLogEntry,
} from '../../base/game-engine.interface';

function createLog(
  type: 'system' | 'action' | 'message',
  message: string,
  opts?: {
    scope?: GameLogEntry['scope'];
    senderId?: string;
    targetId?: string;
    kind?: string;
  },
): GameLogEntry {
  return {
    id: randomUUID(),
    type,
    message,
    createdAt: new Date().toISOString(),
    scope: opts?.scope ?? 'all',
    senderId: opts?.senderId ?? null,
    senderName: null,
    targetId: opts?.targetId,
    kind: opts?.kind,
  };
}

export interface ShipAbilityPayload {
  abilityId: string;
  targetPlayerId?: string;
  row?: number;
  col?: number;
}

export function executeShipAbility(
  state: SeaBattleState,
  player: SeaBattlePlayer,
  payload: ShipAbilityPayload,
): GameActionResult<SeaBattleState> {
  const abilityDef = SHIP_ABILITIES.find((a) => a.id === payload.abilityId);
  if (!abilityDef) return { success: false, error: 'Unknown ability' };

  // Set cooldown
  if (!state.abilityCooldowns) state.abilityCooldowns = {};
  if (!state.abilityCooldowns[player.playerId]) {
    state.abilityCooldowns[player.playerId] = {};
  }
  state.abilityCooldowns[player.playerId][payload.abilityId] =
    abilityDef.cooldownTurns;

  const target = payload.targetPlayerId
    ? state.players.find((p) => p.playerId === payload.targetPlayerId)
    : undefined;

  switch (payload.abilityId) {
    case 'scout': {
      // Reveal a 3×3 area on target board
      if (!target || payload.row === undefined || payload.col === undefined) {
        return { success: false, error: 'Scout requires target, row, col' };
      }
      const cells: { row: number; col: number; state: CellState }[] = [];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const r = payload.row + dr;
          const c = payload.col + dc;
          if (r >= 0 && r < state.gridSize && c >= 0 && c < state.gridSize) {
            cells.push({ row: r, col: c, state: target.board[r][c] });
          }
        }
      }
      state.logs.push(
        createLog('action', `🔍 Scout revealed ${cells.length} cells!`, {
          senderId: player.playerId,
          targetId: target.playerId,
          kind: 'sb.ability-scout',
        }),
      );
      return { success: true, state };
    }

    case 'barrage': {
      // Fire 3 extra shots at random cells on target
      if (!target) return { success: false, error: 'Barrage requires target' };
      const emptyCells: { row: number; col: number }[] = [];
      for (let r = 0; r < state.gridSize; r++) {
        for (let c = 0; c < state.gridSize; c++) {
          if (target.board[r][c] === CELL_STATE.EMPTY || target.board[r][c] === CELL_STATE.SHIP) {
            emptyCells.push({ row: r, col: c });
          }
        }
      }
      // Shuffle and pick 3
      const shuffled = emptyCells.sort(() => Math.random() - 0.5);
      const shots = shuffled.slice(0, 3);
      let hits = 0;
      for (const shot of shots) {
        if (target.board[shot.row][shot.col] === CELL_STATE.SHIP) {
          target.board[shot.row][shot.col] = CELL_STATE.HIT;
          hits++;
          // Find and damage the ship
          const hitShip = target.ships.find((s) =>
            s.cells.some((c) => c.row === shot.row && c.col === shot.col),
          );
          if (hitShip) {
            hitShip.hits++;
            if (hitShip.hits === hitShip.size) {
              hitShip.sunk = true;
              target.shipsRemaining--;
            }
          }
        } else {
          target.board[shot.row][shot.col] = CELL_STATE.MISS;
        }
      }
      const label = `${ROW_LABELS[payload.row ?? 0]}${COL_LABELS[payload.col ?? 0]}`;
      state.logs.push(
        createLog(
          'action',
          `💥 Barrage hit ${hits}/3 shots on ${target.playerId}'s fleet!`,
          {
            senderId: player.playerId,
            targetId: target.playerId,
            kind: 'sb.ability-barrage',
          },
        ),
      );
      return { success: true, state };
    }

    case 'sonar_ping': {
      // Reveal if any ship is within 2 cells of target
      if (!target || payload.row === undefined || payload.col === undefined) {
        return { success: false, error: 'Sonar Ping requires target, row, col' };
      }
      let hasShip = false;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const r = payload.row + dr;
          const c = payload.col + dc;
          if (r >= 0 && r < state.gridSize && c >= 0 && c < state.gridSize) {
            if (target.board[r][c] === CELL_STATE.SHIP) {
              hasShip = true;
              break;
            }
          }
        }
        if (hasShip) break;
      }
      const cellLabel = `${ROW_LABELS[payload.row]}${COL_LABELS[payload.col]}`;
      state.logs.push(
        createLog(
          'action',
          hasShip
            ? `📡 Sonar Ping at ${cellLabel}: SHIP DETECTED!`
            : `📡 Sonar Ping at ${cellLabel}: clear`,
          {
            senderId: player.playerId,
            targetId: target.playerId,
            kind: 'sb.ability-sonar-ping',
          },
        ),
      );
      return { success: true, state };
    }

    case 'torpedo': {
      // Guaranteed hit on targeted cell (if ship is there)
      if (!target || payload.row === undefined || payload.col === undefined) {
        return { success: false, error: 'Torpedo requires target, row, col' };
      }
      const cellState = target.board[payload.row][payload.col];
      const cellLabel = `${ROW_LABELS[payload.row]}${COL_LABELS[payload.col]}`;
      if (cellState === CELL_STATE.SHIP) {
        target.board[payload.row][payload.col] = CELL_STATE.HIT;
        const hitShip = target.ships.find((s) =>
          s.cells.some(
            (c) => c.row === payload.row && c.col === payload.col,
          ),
        );
        if (hitShip) {
          hitShip.hits++;
          if (hitShip.hits === hitShip.size) {
            hitShip.sunk = true;
            target.shipsRemaining--;
          }
        }
        state.logs.push(
          createLog('action', `🎯 Torpedo hit at ${cellLabel}!`, {
            senderId: player.playerId,
            targetId: target.playerId,
            kind: 'sb.ability-torpedo',
          }),
        );
      } else {
        state.logs.push(
          createLog('action', `🎯 Torpedo missed at ${cellLabel}!`, {
            senderId: player.playerId,
            targetId: target.playerId,
            kind: 'sb.ability-torpedo-miss',
          }),
        );
      }
      return { success: true, state };
    }

    case 'silent_run': {
      // Immune to sonar for 1 turn — mark in specialWeaponUsage
      state.logs.push(
        createLog('action', `🤫 Silent Run activated — immune to sonar!`, {
          senderId: player.playerId,
          kind: 'sb.ability-silent-run',
        }),
      );
      return { success: true, state };
    }

    case 'patrol_scout': {
      // Reveal a single cell
      if (!target || payload.row === undefined || payload.col === undefined) {
        return { success: false, error: 'Patrol Scout requires target, row, col' };
      }
      const cellState = target.board[payload.row][payload.col];
      const cellLabel = `${ROW_LABELS[payload.row]}${COL_LABELS[payload.col]}`;
      state.logs.push(
        createLog(
          'action',
          `🔭 Scout at ${cellLabel}: ${cellState === CELL_STATE.SHIP ? 'SHIP' : cellState === CELL_STATE.HIT ? 'HIT' : cellState === CELL_STATE.MISS ? 'MISS' : 'EMPTY'}`,
          {
            senderId: player.playerId,
            targetId: target.playerId,
            kind: 'sb.ability-patrol-scout',
          },
        ),
      );
      return { success: true, state };
    }

    default:
      return { success: false, error: 'Unknown ability' };
  }
}
