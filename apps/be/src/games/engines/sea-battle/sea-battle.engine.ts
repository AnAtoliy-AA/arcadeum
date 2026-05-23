import { Injectable, Logger } from '@nestjs/common';
import { BaseGameEngine } from '../base/base-game-engine.abstract';
import {
  GameMetadata,
  GameActionResult,
  GameActionContext,
} from '../base/game-engine.interface';
import {
  CELL_STATE,
  SHIPS,
  GAME_PHASE,
  ATTACK_RESULT,
  ROW_LABELS,
  COL_LABELS,
  type AttackResult,
} from './sea-battle.constants';
import {
  SeaBattlePlayer,
  SeaBattleState,
  PlaceShipPayload,
  AttackPayload,
  ChatPayload,
} from './sea-battle.types';
import {
  createEmptyBoard,
  sanitizeSeaBattleState,
  getSeaBattleAvailableActions,
  markSurroundingCellsAsMiss,
} from './sea-battle.utils';
import {
  validatePlaceShip,
  validateAutoPlace,
  validateConfirmPlacement,
  validateResetPlacement,
  validateAttack,
} from './sea-battle.validators';
import {
  advanceTeamRotationOnMiss,
  countAliveTeams,
  getActiveShooterId,
  getActiveTeam,
  healStuckTeamRotation,
  isTeamAlive,
  normalizeTeamShooterAfterDeath,
} from './team-rotation.utils';
import {
  runPlaceShip,
  runAutoPlace,
  runConfirmPlacement,
  runResetPlacement,
} from './sea-battle-placement-actions.utils';

@Injectable()
export class SeaBattleEngine extends BaseGameEngine<SeaBattleState> {
  private readonly logger = new Logger(SeaBattleEngine.name);

  getMetadata(): GameMetadata {
    return {
      gameId: 'sea_battle_v1',
      name: 'Sea Battle',
      minPlayers: 2,
      maxPlayers: 8,
      version: '1.1.0',
      description: 'Classic naval combat game (FFA up to 6, team mode up to 8)',
      category: 'Strategy',
    };
  }

  initializeState(
    playerIds: string[],
    config?: {
      teams?: Array<{
        id: string;
        name: string;
        color: string;
        playerIds: string[];
      }>;
      hideShipsFromTeammates?: boolean;
    } & Record<string, unknown>,
  ): SeaBattleState {
    const players: SeaBattlePlayer[] = playerIds.map((id) => ({
      playerId: id,
      alive: true,
      board: createEmptyBoard(),
      ships: [],
      shipsRemaining: SHIPS.length,
      placementComplete: false,
    }));

    const baseState: SeaBattleState = {
      phase: GAME_PHASE.PLACEMENT,
      players,
      playerOrder: playerIds,
      currentTurnIndex: 0,
      logs: [this.createLogEntry('system', 'Game started! Place your ships.')],
    };

    if (config?.teams && config.teams.length > 0) {
      baseState.teams = config.teams.map((t) => ({
        id: t.id,
        name: t.name,
        color: t.color,
        playerIds: [...t.playerIds],
        currentShooterIndex: 0,
      }));
      baseState.teamOrder = config.teams.map((t) => t.id);
      baseState.currentTeamIndex = 0;
      baseState.hideShipsFromTeammates = !!config.hideShipsFromTeammates;
    }

    return baseState;
  }

  validateAction(
    state: SeaBattleState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): boolean {
    const { userId } = context;
    const player = state.players.find((p) => p.playerId === userId);

    if (!player || !player.alive) {
      return false;
    }

    switch (action) {
      case 'placeShip':
        return validatePlaceShip(state, player, payload as PlaceShipPayload);
      case 'autoPlace':
        return validateAutoPlace(state);
      case 'confirmPlacement': {
        const isValid = validateConfirmPlacement(state, player);
        if (!isValid) {
          this.logger.error(
            `[SeaBattleEngine] confirmPlacement validation failed for ${userId}. Phase: ${state.phase}, Ships: ${player.ships.length}/${SHIPS.length}, Ready: ${player.placementComplete}`,
          );
        }
        return isValid;
      }
      case 'attack':
        return validateAttack(state, player, payload as AttackPayload);

      case 'resetPlacement':
        return validateResetPlacement(state, player);
      case 'chat':
        return true;
      default:
        return false;
    }
  }

  normalizeState(state: SeaBattleState): SeaBattleState {
    // Heal team rotations that may have drifted (e.g. a team's shooter pointer
    // left on a dead player by a pre-ARC-646 server). Mutates in place and
    // returns the same reference. Idempotent on healthy state.
    if (state.phase === GAME_PHASE.BATTLE && state.teams) {
      healStuckTeamRotation(state);
    }
    return state;
  }

  executeAction(
    state: SeaBattleState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): GameActionResult<SeaBattleState> {
    const newState = this.cloneState(state);
    const player = newState.players.find((p) => p.playerId === context.userId);

    if (!player) {
      return this.errorResult('Player not found');
    }

    switch (action) {
      case 'placeShip':
        return this.executePlaceShip(
          newState,
          player,
          payload as PlaceShipPayload,
        );
      case 'autoPlace':
        return this.executeAutoPlace(newState, player);
      case 'confirmPlacement':
        return this.executeConfirmPlacement(newState, player);
      case 'attack':
        return this.executeAttack(newState, player, payload as AttackPayload);

      case 'resetPlacement':
        return this.executeResetPlacement(newState, player);
      case 'chat':
        return this.executeChat(newState, player, payload as ChatPayload);
      default:
        return this.errorResult('Unknown action');
    }
  }

  private executePlaceShip(
    state: SeaBattleState,
    player: SeaBattlePlayer,
    payload: PlaceShipPayload,
  ): GameActionResult<SeaBattleState> {
    return runPlaceShip(state, player, payload);
  }

  private executeAutoPlace(
    state: SeaBattleState,
    player: SeaBattlePlayer,
  ): GameActionResult<SeaBattleState> {
    return runAutoPlace(state, player);
  }

  private executeConfirmPlacement(
    state: SeaBattleState,
    player: SeaBattlePlayer,
  ): GameActionResult<SeaBattleState> {
    return runConfirmPlacement(state, player);
  }

  private executeResetPlacement(
    state: SeaBattleState,
    player: SeaBattlePlayer,
  ): GameActionResult<SeaBattleState> {
    return runResetPlacement(state, player);
  }

  private executeAttack(
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

          markSurroundingCellsAsMiss(target, hitShip);
          state.logs.push(
            this.createLogEntry('action', `☠️ sunk ${shipName}!`, {
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
          this.createLogEntry('system', 'A player has been eliminated!', {
            senderId: target.playerId,
          }),
        );
        // In team mode, make sure the eliminated player isn't left as their
        // team's active shooter — otherwise their team's next turn deadlocks
        // on a dead player.
        normalizeTeamShooterAfterDeath(state, target.playerId);
        this.checkAndSetWinner(state);
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
      this.createLogEntry(
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
        this.advanceToNextPlayer(state);
      }
    }

    return this.successResult(state);
  }

  private advanceToNextPlayer(state: SeaBattleState): void {
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

  private executeChat(
    state: SeaBattleState,
    player: SeaBattlePlayer,
    payload: ChatPayload,
  ): GameActionResult<SeaBattleState> {
    state.logs.push(
      this.createLogEntry('message', payload.message, {
        scope: payload.scope || 'all',
        senderId: player.playerId,
      }),
    );

    return this.successResult(state);
  }

  isGameOver(state: SeaBattleState): boolean {
    if (state.phase !== GAME_PHASE.BATTLE) return false;
    if (state.teams) {
      return countAliveTeams(state) <= 1;
    }
    const alivePlayers = state.players.filter((p) => p.alive);
    return alivePlayers.length <= 1;
  }

  getWinners(state: SeaBattleState): string[] {
    if (state.teams && state.teamOrder) {
      const survivingTeamIds = state.teamOrder.filter((tid) =>
        isTeamAlive(state, tid),
      );
      if (survivingTeamIds.length === 1) {
        const team = state.teams.find((t) => t.id === survivingTeamIds[0])!;
        return [...team.playerIds];
      }
      if (survivingTeamIds.length === 0) {
        this.logger.error('Sea Battle ended with no surviving teams');
      }
      return [];
    }
    const alivePlayers = state.players.filter((p) => p.alive);
    if (alivePlayers.length === 1) {
      state.winnerId = alivePlayers[0].playerId;
      return [alivePlayers[0].playerId];
    }
    return [];
  }

  sanitizeStateForPlayer(
    state: SeaBattleState,
    playerId: string,
  ): Partial<SeaBattleState> {
    return sanitizeSeaBattleState(state, playerId);
  }

  getAvailableActions(state: SeaBattleState, playerId: string): string[] {
    return getSeaBattleAvailableActions(state, playerId);
  }

  removePlayer(
    state: SeaBattleState,
    playerId: string,
  ): GameActionResult<SeaBattleState> {
    const newState = this.cloneState(state);
    const player = newState.players.find((p) => p.playerId === playerId);
    if (!player) {
      return this.successResult(newState);
    }

    player.alive = false;
    newState.logs.push(
      this.createLogEntry('system', 'A player has left the game', {
        senderId: playerId,
      }),
    );

    if (newState.teams) {
      const wasActiveShooter = getActiveShooterId(newState) === playerId;

      if (wasActiveShooter) {
        // Active shooter forfeits the turn — advance like a miss so the
        // next team plays and the leaver's team rotates to the next teammate.
        advanceTeamRotationOnMiss(newState);
      } else {
        // Otherwise, only patch up the leaver's own team shooter pointer so
        // a live teammate is queued up when their team plays again.
        const team = newState.teams.find((t) => t.playerIds.includes(playerId));
        if (team && team.playerIds[team.currentShooterIndex] === playerId) {
          const n = team.playerIds.length;
          let next = team.currentShooterIndex;
          for (let step = 0; step < n; step++) {
            next = (next + 1) % n;
            const candidate = newState.players.find(
              (p) => p.playerId === team.playerIds[next],
            );
            if (candidate?.alive) {
              team.currentShooterIndex = next;
              break;
            }
          }
        }
      }

      // Keep currentTurnIndex in sync with the active shooter so consumers
      // that read playerOrder[currentTurnIndex] (e.g. the bot service) match.
      const activeTeam = getActiveTeam(newState);
      if (activeTeam) {
        const shooter = getActiveShooterId(newState);
        if (shooter) {
          const idx = newState.playerOrder.indexOf(shooter);
          if (idx >= 0) newState.currentTurnIndex = idx;
        }
      }
    } else if (newState.playerOrder[newState.currentTurnIndex] === playerId) {
      this.advanceToNextPlayer(newState);
    }

    this.checkAndSetWinner(newState);
    return this.successResult(newState);
  }

  private checkAndSetWinner(state: SeaBattleState): void {
    if (state.teams && state.teamOrder) {
      if (countAliveTeams(state) <= 1) {
        const winningTeamId = state.teamOrder.find((tid) =>
          isTeamAlive(state, tid),
        );
        if (winningTeamId) {
          state.winnerId = winningTeamId;
          state.logs.push(
            this.createLogEntry('system', 'Game Over! Team has won!'),
          );
        }
      }
      return;
    }
    const alivePlayers = state.players.filter((p) => p.alive);
    if (alivePlayers.length === 1) {
      state.winnerId = alivePlayers[0].playerId;
      state.logs.push(
        this.createLogEntry('system', 'Game Over! We have a winner!'),
      );
    }
  }
}
