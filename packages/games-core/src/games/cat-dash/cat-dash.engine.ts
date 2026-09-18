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
  sanitizeCatDashState,
  getAvailableActions,
} from './cat-dash.utils';
import {
  validateRollDice,
  validateUseAbility,
  validateChoosePath,
  validateForfeit,
} from './cat-dash.validators';
import { executeRollDiceHelper } from './cat-dash.roll-handler';
import { executeUseAbilityHelper } from './cat-dash.ability-handler';

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
      shielded: false,
      speedBoostPending: 0,
      extraRollPending: false,
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
      traps: [],
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
    const { state: updatedState, logs } = executeRollDiceHelper(
      state,
      player,
      (type, msg, opts) => this.createLogEntry(type, msg, opts),
    );

    for (const log of logs) {
      this.addLog(updatedState, log);
    }

    return this.successResult(updatedState, logs);
  }

  private executeUseAbility(
    state: CatDashState,
    player: CatDashPlayer,
    abilityId: string,
  ): GameActionResult<CatDashState> {
    const { state: updatedState, logs } = executeUseAbilityHelper(
      state,
      player,
      abilityId,
      (type, msg, opts) => this.createLogEntry(type, msg, opts),
    );

    for (const log of logs) {
      this.addLog(updatedState, log);
    }

    return this.successResult(updatedState, logs);
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
}
