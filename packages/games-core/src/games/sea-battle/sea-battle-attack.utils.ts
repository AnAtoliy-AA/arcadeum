import { randomUUID } from '../../lib/random';
import {
  CELL_STATE,
  GAME_PHASE,
  ATTACK_RESULT,
  ROW_LABELS,
  COL_LABELS,
  GAME_MODE_VARIANTS,
  SPEED_TURN_BUDGET_MS,
  type AttackResult,
} from './sea-battle.constants';
import {
  SeaBattlePlayer,
  SeaBattleState,
  AttackPayload,
} from './sea-battle.types';
import { markSurroundingCellsAsMiss } from './sea-battle.utils';
import {
  advanceTeamRotationOnMiss,
  getActiveShooterId,
} from './team-rotation.utils';
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

function advanceToNextPlayer(state: SeaBattleState): void {
  const aliveCount = state.players.reduce((n, p) => n + (p.alive ? 1 : 0), 0);
  if (aliveCount <= 1) return;

  // Build O(1) lookup map once instead of players.find() on each iteration.
  const playerMap = new Map<string, SeaBattlePlayer>();
  for (const p of state.players) playerMap.set(p.playerId, p);

  let nextIndex = state.currentTurnIndex;
  do {
    nextIndex = (nextIndex + 1) % state.playerOrder.length;
    if (playerMap.get(state.playerOrder[nextIndex])?.alive) {
      state.currentTurnIndex = nextIndex;
      return;
    }
  } while (nextIndex !== state.currentTurnIndex);
}

function setTurnDeadline(state: SeaBattleState): void {
  const activeId = state.teams
    ? getActiveShooterId(state)
    : state.playerOrder[state.currentTurnIndex];
  if (!activeId) return;
  const player = state.players.find((p) => p.playerId === activeId);
  if (player) {
    player.turnDeadline = Date.now() + SPEED_TURN_BUDGET_MS;
  }
}

export function executeAttack(
  state: SeaBattleState,
  player: SeaBattlePlayer,
  payload: AttackPayload,
): GameActionResult<SeaBattleState> {
  const target = state.players.find(
    (p) => p.playerId === payload.targetPlayerId,
  ) as SeaBattlePlayer;

  const { row, col } = payload;
  const cellLabel = `${ROW_LABELS[row]}${COL_LABELS[col]}`;
  let result: AttackResult;
  let shipName: string | undefined;

  const cellState = target.board[row][col];

  if (cellState === CELL_STATE.SHIP) {
    target.board[row][col] = CELL_STATE.HIT;
    result = ATTACK_RESULT.HIT;

    const hitShip = target.ships.find((s) =>
      s.cells.some((c) => c.row === row && c.col === col),
    );

    if (hitShip) {
      hitShip.hits++;
      shipName = hitShip.name;

      if (hitShip.hits === hitShip.size) {
        hitShip.sunk = true;
        target.shipsRemaining--;
        result = ATTACK_RESULT.SUNK;

        markSurroundingCellsAsMiss(target, hitShip, state.gridSize);
        state.logs.push(
          createLog('action', `☠️ sunk ${shipName}!`, {
            senderId: player.playerId,
            targetId: target.playerId,
            kind: 'sb.sunk-ship',
          }),
        );
      }
    }

    if (target.shipsRemaining === 0) {
      target.alive = false;
      state.logs.push(
        createLog('system', 'has been eliminated!', {
          senderId: target.playerId,
        }),
      );
      normalizeTeamShooterAfterDeath(state, target.playerId);
      checkAndSetWinner(state);
    }
  } else {
    target.board[row][col] = CELL_STATE.MISS;
    result = ATTACK_RESULT.MISS;
  }

  state.lastAttack = {
    attackerId: player.playerId,
    targetId: target.playerId,
    row,
    col,
    result,
    shipName,
  };

  const resultMark =
    result === ATTACK_RESULT.HIT
      ? '💥'
      : result === ATTACK_RESULT.SUNK
        ? '☠️'
        : '🌊';
  state.logs.push(
    createLog(
      'action',
      `attacked ${cellLabel} — ${resultMark} ${result.toUpperCase()}!`,
      {
        senderId: player.playerId,
        targetId: target.playerId,
        kind: `sb.attack-${result}`,
      },
    ),
  );

  if (result === ATTACK_RESULT.MISS) {
    if (state.teams) {
      advanceTeamRotationOnMiss(state);
      const shooter = getActiveShooterId(state);
      if (shooter) {
        state.currentTurnIndex = state.playerOrder.indexOf(shooter);
      }
    } else {
      advanceToNextPlayer(state);
    }

    state.roundNumber = (state.roundNumber ?? 1) + 1;
  }

  if (state.mode === GAME_MODE_VARIANTS.SPEED) {
    setTurnDeadline(state);
  }

  return { success: true, state };
}

function normalizeTeamShooterAfterDeath(
  state: SeaBattleState,
  playerId: string,
): void {
  if (!state.teams) return;
  const activeTeam = state.teams.find((t) =>
    t.playerIds.includes(state.playerOrder[state.currentTurnIndex] ?? ''),
  );
  if (!activeTeam) return;
  const currentShooter = activeTeam.playerIds[activeTeam.currentShooterIndex];
  if (currentShooter === playerId) {
    const n = activeTeam.playerIds.length;
    for (let step = 0; step < n; step++) {
      const next = (activeTeam.currentShooterIndex + 1 + step) % n;
      const candidate = state.players.find(
        (p) => p.playerId === activeTeam.playerIds[next],
      );
      if (candidate?.alive) {
        activeTeam.currentShooterIndex = next;
        return;
      }
    }
  }
}

function checkAndSetWinner(state: SeaBattleState): void {
  if (state.phase !== GAME_PHASE.BATTLE) return;
  if (state.teams && state.teamOrder) {
    // Pre-build player alive map once to avoid nested .find() per team per player.
    const aliveSet = new Set<string>();
    for (const p of state.players) {
      if (p.alive) aliveSet.add(p.playerId);
    }
    const teamMap = new Map<string, (typeof state.teams)[0]>();
    for (const team of state.teams) teamMap.set(team.id, team);

    const aliveTeamIds = state.teamOrder.filter((tid) =>
      teamMap.get(tid)?.playerIds.some((pid) => aliveSet.has(pid)),
    );
    if (aliveTeamIds.length <= 1) {
      const winningTeamId = aliveTeamIds[0];
      if (winningTeamId) {
        state.winnerId = winningTeamId;
        state.phase = GAME_PHASE.COMPLETED;
        state.logs.push(createLog('system', 'Game Over! Team has won!'));
      }
    }
    return;
  }
  const alivePlayers = state.players.filter((p) => p.alive);
  if (alivePlayers.length === 1) {
    state.winnerId = alivePlayers[0].playerId;
    state.phase = GAME_PHASE.COMPLETED;
    state.logs.push(createLog('system', 'Game Over! We have a winner!'));
  }
}
