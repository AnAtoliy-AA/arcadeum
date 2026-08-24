import { createLogger } from '../../lib/logger';
import { BaseGameEngine } from '../../base/base-game-engine.abstract';
import {
  GameMetadata,
  GameActionResult,
  GameActionContext,
} from '../../base/game-engine.interface';
import {
  BOARD_SIZE,
  GAME_PHASE,
  getActiveShips,
  getDefaultShipCount,
  GAME_MODE_VARIANTS,
} from './sea-battle.constants';
import {
  SeaBattlePlayer,
  SeaBattleState,
  SeaBattleConfig,
  PlaceShipPayload,
  MoveShipPayload,
  AttackPayload,
  SonarPayload,
  RadarPayload,
  ChatPayload,
  BatchPlacementPayload,
} from './sea-battle.types';
import {
  createEmptyBoard,
  sanitizeSeaBattleState,
  getSeaBattleAvailableActions,
} from './sea-battle.utils';
import {
  validatePlaceShip,
  validateMoveShip,
  validateAutoPlace,
  validateConfirmPlacement,
  validateResetPlacement,
  validateAttack,
  validateUseSonar,
  validateUseRadar,
} from './sea-battle.validators';
import { executeSonar, executeRadar } from './sea-battle.special-weapons';
import { executeAttack } from './sea-battle-attack.utils';
import { validateSeaBattleConfig } from './sea-battle.config';
import {
  advanceTeamRotationOnMiss,
  countAliveTeams,
  getActiveShooterId,
  getActiveTeam,
  healStuckTeamRotation,
  isTeamAlive,
} from './team-rotation.utils';
import {
  runPlaceShip,
  runMoveShip,
  runAutoPlace,
  runConfirmPlacement,
  runResetPlacement,
  runBatchPlacement,
} from './sea-battle-placement-actions.utils';
export class SeaBattleEngine extends BaseGameEngine<SeaBattleState> {
  private readonly logger = createLogger('SeaBattleEngine');
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
    config?: SeaBattleConfig & Record<string, unknown>,
  ): SeaBattleState {
    const mode = config?.mode ?? GAME_MODE_VARIANTS.CLASSIC;
    const gridSize = config?.gridSize ?? BOARD_SIZE;
    const shouldRandomize = config?.firstPlayer === 'random';
    const orderedIds = shouldRandomize
      ? [...playerIds].sort(() => Math.random() - 0.5)
      : [...playerIds];
    const shipCount = config?.shipCount ?? getDefaultShipCount(gridSize);
    const activeShipCount = getActiveShips(shipCount).length;
    const players: SeaBattlePlayer[] = orderedIds.map((id) => ({
      playerId: id,
      alive: true,
      board: createEmptyBoard(gridSize),
      ships: [],
      shipsRemaining: activeShipCount,
      placementComplete: false,
    }));
    const baseState: SeaBattleState = {
      phase: GAME_PHASE.PLACEMENT,
      players,
      playerOrder: orderedIds,
      currentTurnIndex: 0,
      logs: [
        this.createLogEntry(
          'system',
          `Game started! Mode: ${mode}. Place your ships.`,
        ),
      ],
      mode,
      roundNumber: 1,
      gridSize,
      shipCount,
      specialWeapons: config?.specialWeapons,
      aiDifficulty: config?.aiDifficulty,
    };
    if (config?.teams && config.teams.length > 0) {
      const orderedTeams = shouldRandomize
        ? [...config.teams].sort(() => Math.random() - 0.5)
        : config.teams;
      baseState.teams = orderedTeams.map((t) => ({
        id: t.id,
        name: t.name,
        color: t.color,
        playerIds: [...t.playerIds],
        currentShooterIndex: 0,
      }));
      baseState.teamOrder = orderedTeams.map((t) => t.id);
      baseState.currentTeamIndex = 0;
      baseState.hideShipsFromTeammates = !!config.hideShipsFromTeammates;
    }

    return baseState;
  }
  validateConfig(config: Record<string, unknown>): boolean {
    return validateSeaBattleConfig(config);
  }
  validateAction(
    state: SeaBattleState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): boolean {
    const { userId } = context;
    const player = state.players.find((p) => p.playerId === userId);

    if (action === 'chat') return true;

    if (!player || !player.alive) return false;

    switch (action) {
      case 'placeShip':
        return validatePlaceShip(state, player, payload as PlaceShipPayload);
      case 'moveShip':
        return validateMoveShip(state, player, payload as MoveShipPayload);
      case 'autoPlace':
        return validateAutoPlace(state);
      case 'confirmPlacement': {
        const isValid = validateConfirmPlacement(
          state,
          player,
          payload as BatchPlacementPayload | undefined,
        );
        if (!isValid) {
          this.logger.error(
            `[SeaBattleEngine] confirmPlacement validation failed for ${userId}. Phase: ${state.phase}, Ships: ${player.ships.length}/${getActiveShips(state.shipCount).length}, Ready: ${player.placementComplete}`,
          );
        }
        return isValid;
      }
      case 'attack':
        return validateAttack(state, player, payload as AttackPayload);
      case 'useSonar':
        return validateUseSonar(state, player, payload as SonarPayload);
      case 'useRadar':
        return validateUseRadar(state, player, payload as RadarPayload);
      case 'resetPlacement':
        return validateResetPlacement(state, player);
      default:
        return false;
    }
  }

  normalizeState(state: SeaBattleState): SeaBattleState {
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
    if (!player) return this.errorResult('Player not found');

    switch (action) {
      case 'placeShip':
        return runPlaceShip(newState, player, payload as PlaceShipPayload);
      case 'moveShip':
        return runMoveShip(newState, player, payload as MoveShipPayload);
      case 'autoPlace':
        return runAutoPlace(newState, player);
      case 'confirmPlacement': {
        const batchPayload = payload as BatchPlacementPayload | undefined;
        if (batchPayload?.ships && Array.isArray(batchPayload.ships)) {
          return runBatchPlacement(newState, player, batchPayload);
        }
        return runConfirmPlacement(newState, player);
      }
      case 'resetPlacement':
        return runResetPlacement(newState, player);
      case 'attack':
        delete newState.lastScanWave;
        return executeAttack(newState, player, payload as AttackPayload);
      case 'useSonar':
        delete newState.lastScanWave;
        return executeSonar(newState, player, payload as SonarPayload);
      case 'useRadar':
        delete newState.lastScanWave;
        return executeRadar(newState, player, payload as RadarPayload);
      case 'chat':
        return this.executeChat(newState, player, payload as ChatPayload);
      default:
        return this.errorResult('Unknown action');
    }
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

  private advanceToNextPlayer(state: SeaBattleState): void {
    const aliveCount = state.players.reduce((n, p) => n + (p.alive ? 1 : 0), 0);
    if (aliveCount <= 1) return;

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

  isGameOver(state: SeaBattleState): boolean {
    if (state.phase === GAME_PHASE.COMPLETED) return true;
    if (state.phase !== GAME_PHASE.BATTLE) return false;
    if (state.teams) return countAliveTeams(state) <= 1;
    const aliveCount = state.players.reduce((n, p) => n + (p.alive ? 1 : 0), 0);
    return aliveCount <= 1;
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
      this.createLogEntry('system', 'left the game', {
        senderId: playerId,
      }),
    );

    if (newState.teams) {
      const wasActiveShooter = getActiveShooterId(newState) === playerId;

      if (wasActiveShooter) {
        advanceTeamRotationOnMiss(newState);
      } else {
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

      // Keep currentTurnIndex in sync with the active shooter
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
          state.phase = GAME_PHASE.COMPLETED;
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
      state.phase = GAME_PHASE.COMPLETED;
      state.logs.push(
        this.createLogEntry('system', 'Game Over! We have a winner!'),
      );
    }
  }
}
