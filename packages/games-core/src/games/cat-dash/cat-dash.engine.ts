import { createLogger } from '../../lib/logger';
import { BaseGameEngine } from '../../base/base-game-engine.abstract';
import {
  GameMetadata,
  GameActionResult,
  GameActionContext,
} from '../../base/game-engine.interface';
import type { CatDashState, CatDashPlayer } from './cat-dash.types';
import {
  MIN_PLAYERS,
  MAX_PLAYERS,
  CAT_IDS,
  DEFAULT_OPTIONS,
  POWER_TOKENS_PER_GAME,
} from './cat-dash.constants';
import type { TrackType, Theme } from './cat-dash.constants';
import {
  generateTrack,
  calculateMovement,
  checkWinCondition,
  applySpaceEffect,
  rollDice,
  sanitizeCatDashState,
  getAvailableActions,
} from './cat-dash.utils';
import {
  validateRollDice,
  validateUseAbility,
  validateChoosePath,
  validateForfeit,
} from './cat-dash.validators';
export class CatDashEngine extends BaseGameEngine<CatDashState> {
  private readonly logger = createLogger('CatDashEngine');

  getMetadata(): GameMetadata {
    return {
      gameId: 'cat_dash_v1',
      name: 'Cat Dash',
      minPlayers: MIN_PLAYERS,
      maxPlayers: MAX_PLAYERS,
      version: '1.0.0',
      description: 'A cat racing dice game with unique abilities and themes',
      category: 'Race',
    };
  }

  initializeState(
    playerIds: string[],
    config?: Record<string, unknown>,
  ): CatDashState {
    const options = (config?.options ?? {}) as Partial<{
      trackType: TrackType;
      theme: Theme;
      columns?: number;
      trackLength?: number;
    }>;
    const trackType = options.trackType || DEFAULT_OPTIONS.trackType;
    const theme = options.theme || DEFAULT_OPTIONS.theme;
    const columns = Number(options.columns) || 10;
    const trackLength = Number(options.trackLength) || 60;

    const players: CatDashPlayer[] = playerIds.map((id, index) => ({
      playerId: id,
      catId: CAT_IDS[index % CAT_IDS.length],
      position: 0,
      powerTokens: POWER_TOKENS_PER_GAME,
      abilitiesUsed: [],
      isReady: true,
      hasBonus: false,
    }));

    return {
      trackType,
      theme,
      columns,
      trackLength,
      players,
      currentPlayerIndex: 0,
      turnNumber: 1,
      track: generateTrack(trackType, trackLength),
      gameOver: false,
      logs: [
        this.createLogEntry(
          'system',
          `Cat Dash started! Track: ${trackType}, Theme: ${theme}. Roll the dice to race!`,
        ),
      ],
    };
  }

  validateAction(
    state: CatDashState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): boolean {
    const player = state.players.find((p) => p.playerId === context.userId);
    if (!player) return false;

    const p = payload as Record<string, unknown> | undefined;

    switch (action) {
      case 'rollDice':
        return validateRollDice(state, player);
      case 'useAbility':
        return validateUseAbility(state, player, p?.abilityId as string);
      case 'choosePath':
        return validateChoosePath(state, player, p?.pathIndex as number);
      case 'forfeit':
        return validateForfeit(state, player);
      case 'chat':
        return true;
      default:
        return false;
    }
  }

  executeAction(
    state: CatDashState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): GameActionResult<CatDashState> {
    const newState = this.cloneState(state);
    const player = newState.players.find((p) => p.playerId === context.userId);
    if (!player) return this.errorResult('Player not found');

    const p = payload as Record<string, unknown> | undefined;

    switch (action) {
      case 'rollDice':
        return this.executeRollDice(newState, player);
      case 'useAbility':
        return this.executeUseAbility(newState, player, p?.abilityId as string);
      case 'choosePath':
        return this.executeChoosePath(newState, player, p?.pathIndex as number);
      case 'forfeit':
        return this.executeForfeit(newState, player);
      case 'chat':
        return this.executeChat(
          newState,
          player,
          (p?.message as string) ?? '',
          p?.scope as string as 'all' | 'players' | 'private' | undefined,
        );
      default:
        return this.errorResult('Unknown action');
    }
  }

  private executeRollDice(
    state: CatDashState,
    player: CatDashPlayer,
  ): GameActionResult<CatDashState> {
    const roll = rollDice();
    const movement = calculateMovement(roll, player.hasBonus, 0);

    const logs = [
      this.createLogEntry(
        'action',
        `Rolled ${roll}, moving ${movement} spaces`,
        { senderId: player.playerId },
      ),
    ];

    player.position = Math.min(
      player.position + movement,
      state.track.length - 1,
    );
    player.hasBonus = false;

    const space = state.track[player.position];
    if (space.effect) {
      const effects = applySpaceEffect(space.effect);
      if (effects.skipTurn) {
        logs.push(
          this.createLogEntry('system', 'Hit an obstacle, skipping next turn', {
            senderId: player.playerId,
          }),
        );
      }
      if (effects.extraRoll) {
        logs.push(
          this.createLogEntry('system', 'Found a bonus, rolling again', {
            senderId: player.playerId,
          }),
        );
      }
    }

    if (checkWinCondition(player.position, state.trackLength)) {
      state.winner = player.playerId;
      state.gameOver = true;
      logs.push(
        this.createLogEntry('system', 'Crossed the finish line! Game over!', {
          senderId: player.playerId,
        }),
      );
      state.gameResult = { winnerIds: [player.playerId], isDraw: false };
    }

    for (const log of logs) {
      this.addLog(state, log);
    }

    if (!state.gameOver) {
      state.currentPlayerIndex =
        (state.currentPlayerIndex + 1) % state.players.length;
    }

    return this.successResult(state, logs);
  }

  private executeUseAbility(
    state: CatDashState,
    player: CatDashPlayer,
    abilityId: string,
  ): GameActionResult<CatDashState> {
    player.abilitiesUsed.push(abilityId);
    player.powerTokens -= 1;

    const log = this.createLogEntry('action', `Used ability ${abilityId}`, {
      senderId: player.playerId,
    });
    this.addLog(state, log);

    return this.successResult(state, [log]);
  }

  private executeChoosePath(
    state: CatDashState,
    player: CatDashPlayer,
    pathIndex: number,
  ): GameActionResult<CatDashState> {
    const log = this.createLogEntry('action', `Chose path ${pathIndex}`, {
      senderId: player.playerId,
    });
    this.addLog(state, log);

    return this.successResult(state, [log]);
  }

  private executeForfeit(
    state: CatDashState,
    player: CatDashPlayer,
  ): GameActionResult<CatDashState> {
    player.isReady = false;
    player.position = -1;

    const log = this.createLogEntry('system', 'Forfeited the race', {
      senderId: player.playerId,
    });
    this.addLog(state, log);

    const alivePlayers = state.players.filter(
      (p) => p.isReady && p.position >= 0,
    );
    if (alivePlayers.length === 1) {
      state.winner = alivePlayers[0].playerId;
      state.gameOver = true;
      state.gameResult = {
        winnerIds: [alivePlayers[0].playerId],
        isDraw: false,
      };
      const winLog = this.createLogEntry('system', 'Wins by default!');
      this.addLog(state, winLog);
    } else if (alivePlayers.length === 0) {
      state.gameOver = true;
      state.gameResult = { winnerIds: [], isDraw: true };
    }

    return this.successResult(state, [log]);
  }

  private executeChat(
    state: CatDashState,
    player: CatDashPlayer,
    message: string,
    scope?: 'all' | 'players' | 'private',
  ): GameActionResult<CatDashState> {
    const log = this.createLogEntry('message', message, {
      scope: scope || 'all',
      senderId: player.playerId,
    });
    this.addLog(state, log);

    return this.successResult(state, [log]);
  }

  isGameOver(state: CatDashState): boolean {
    return state.gameOver;
  }

  getWinners(state: CatDashState): string[] {
    return state.winner ? [state.winner] : [];
  }

  sanitizeStateForPlayer(
    state: CatDashState,
    playerId: string,
  ): Partial<CatDashState> {
    return sanitizeCatDashState(state, playerId);
  }

  getAvailableActions(state: CatDashState, playerId: string): string[] {
    return getAvailableActions(state, playerId);
  }

  removePlayer(
    state: CatDashState,
    playerId: string,
  ): GameActionResult<CatDashState> {
    const newState = this.cloneState(state);
    const player = newState.players.find((p) => p.playerId === playerId);
    if (!player) {
      return this.successResult(newState);
    }

    player.isReady = false;
    player.position = -1;

    const log = this.createLogEntry('system', 'left the race', {
      senderId: playerId,
    });
    this.addLog(newState, log);

    if (newState.players[newState.currentPlayerIndex]?.playerId === playerId) {
      newState.currentPlayerIndex =
        (newState.currentPlayerIndex + 1) % newState.players.length;
    }

    const alivePlayers = newState.players.filter(
      (p) => p.isReady && p.position >= 0,
    );
    if (alivePlayers.length <= 1) {
      newState.gameOver = true;
      if (alivePlayers.length === 1) {
        newState.winner = alivePlayers[0].playerId;
        newState.gameResult = {
          winnerIds: [alivePlayers[0].playerId],
          isDraw: false,
        };
      } else {
        newState.gameResult = { winnerIds: [], isDraw: true };
      }
    }

    return this.successResult(newState);
  }
}
