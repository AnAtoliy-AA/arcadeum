import { Injectable } from '@nestjs/common';
import { BaseGameEngine } from '../base/base-game-engine.abstract';
import {
  GameMetadata,
  GameActionResult,
  GameActionContext,
} from '../base/game-engine.interface';
import {
  CriticalState,
  CriticalPlayerState,
  CriticalExpansion,
  CustomCardConfig,
  createInitialCriticalState,
  sanitizeCriticalStateForPlayer,
} from '../../critical/critical.state';
import { CriticalLogic, executeCancel } from './critical-logic.utils';
import {
  executeTargetedAttack,
  executePersonalAttack,
  executeAttackOfTheDead,
  executeSuperSkip,
  executeReverse,
} from './critical-attack.utils';
import {
  getAvailableActionsForPlayer,
  validateCriticalAction,
  CriticalPayload,
  FavorExecutePayload,
  TheftPackPayload,
} from './critical-validation.utils';
import { executeFavor, executeGiveFavorCard } from './critical-favor.utils';
import {
  executeCommitAlterFuture,
  dispatchFuturePackAction,
} from './critical-future.utils';
import { dispatchTheftPackAction } from './critical-theft.utils';
import { dispatchChaosPackAction } from './critical-chaos.utils';
import { dispatchDeityPackAction } from './critical-deity.utils';

/**
 * Critical Game Engine
 * Implements all game logic for Critical
 */
@Injectable()
export class CriticalEngine extends BaseGameEngine<CriticalState> {
  getMetadata(): GameMetadata {
    return {
      gameId: 'critical_v1',
      name: 'Critical',
      minPlayers: 2,
      maxPlayers: 5,
      version: '1.0.0',
      description: 'A kitty-powered version of Russian Roulette',
      category: 'Card Game',
    };
  }

  initializeState(
    playerIds: string[],
    config?: Record<string, unknown>,
  ): CriticalState {
    const expansions =
      (config?.expansions as CriticalExpansion[] | undefined) ?? [];
    const allowActionCardCombos =
      (config?.allowActionCardCombos as boolean | undefined) ?? false;
    const customCards =
      (config?.customCards as CustomCardConfig | undefined) ?? undefined;
    return createInitialCriticalState(
      playerIds,
      expansions,
      allowActionCardCombos,
      customCards,
    );
  }

  validateAction(
    state: CriticalState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): boolean {
    return validateCriticalAction(state, action, context, payload);
  }

  executeAction(
    state: CriticalState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): GameActionResult<CriticalState> {
    // Auto-fix legacy state where pendingDraws is 0 at start of turn
    if (
      action === 'draw_card' &&
      state.pendingDraws === 0 &&
      this.isPlayerTurn(state, context.userId)
    ) {
      state.pendingDraws = 1;
    }

    if (!this.validateAction(state, action, context, payload)) {
      return this.errorResult('Invalid action');
    }

    const newState = this.cloneState(state);
    const typedPayload = payload as CriticalPayload | undefined;

    // Use arrow functions instead of bind() to preserve type safety
    const helpers = {
      addLog: (
        state: CriticalState,
        log: ReturnType<typeof this.createLogEntry>,
      ) => this.addLog(state, log),
      createLogEntry: this.createLogEntry.bind(
        this,
      ) as typeof this.createLogEntry,
      advanceTurn: (state: CriticalState) => this.advanceTurn(state),
      shuffleArray: <T>(arr: T[]) => this.shuffleArray(arr),
      findPlayer: (state: CriticalState, pid: string) =>
        this.findPlayer(state, pid) as CriticalPlayerState,
    };

    switch (action) {
      case 'draw_card':
        return CriticalLogic.executeDrawCard(newState, context.userId, helpers);

      case 'play_card': {
        // Intercept Future Pack cards that are played via 'play_card'
        const card = typedPayload?.card;

        if (card) {
          // Try Future Pack first
          const futurePackResult = dispatchFuturePackAction(
            newState,
            context.userId,
            card,
            helpers,
          );
          if (futurePackResult) {
            return futurePackResult;
          }

          // Try Theft Pack
          const theftPackResult = dispatchTheftPackAction(
            newState,
            context.userId,
            card,
            typedPayload?.targetPlayerId,
            helpers,
            {
              partnerCard: undefined,
              selectedIndex: typedPayload?.selectedIndex,
              requestedCard: typedPayload?.requestedCard,
              cardsToStash: typedPayload?.cardsToStash,
              cardsToUnstash: typedPayload?.cardsToUnstash,
            } as TheftPackPayload,
          );
          if (theftPackResult) {
            return theftPackResult;
          }

          // Try Chaos Pack
          const chaosPackResult = dispatchChaosPackAction(
            newState,
            context.userId,
            card,
            typedPayload?.targetPlayerId, // Chaos actions like blackout might need target
            helpers,
          );
          if (chaosPackResult) {
            return chaosPackResult;
          }

          // Try Deity Pack
          const deityPackResult = dispatchDeityPackAction(
            newState,
            context.userId,
            card,
            typedPayload?.targetPlayerId,
            helpers,
          );
          if (deityPackResult) {
            return deityPackResult;
          }
        }

        return CriticalLogic.executePlayCard(
          newState,
          context.userId,
          typedPayload!.card!,
          helpers,
        );
      }

      case 'play_cat_combo':
        return CriticalLogic.executeCollectionCombo(
          newState,
          context.userId,
          typedPayload!.cards!,
          typedPayload?.targetPlayerId ?? null,
          helpers,
          typedPayload?.selectedIndex,
          typedPayload?.requestedCard,
          typedPayload?.requestedDiscardCard,
        );

      case 'insight':
        return CriticalLogic.executeSeeTheFuture(
          newState,
          context.userId,
          helpers,
        );

      case 'trade':
        return executeFavor(
          newState,
          context.userId,
          typedPayload as FavorExecutePayload,
          helpers,
        );

      case 'give_favor_card':
        return executeGiveFavorCard(
          newState,
          context.userId,
          { cardToGive: typedPayload!.cardToGive! },
          helpers,
        );

      case 'neutralizer':
        return CriticalLogic.executeDefuse(
          newState,
          context.userId,
          typedPayload!.position!,
          helpers,
        );

      case 'play_cancel':
        return executeCancel(newState, context.userId, helpers);

      // ===== ATTACK PACK EXPANSION CARDS =====
      case 'targeted_strike':
        return executeTargetedAttack(
          newState,
          context.userId,
          typedPayload!.targetPlayerId!,
          helpers,
        );

      case 'private_strike':
        return executePersonalAttack(newState, context.userId, helpers);

      case 'recursive_strike':
        return executeAttackOfTheDead(newState, context.userId, helpers);

      case 'mega_evade':
        return executeSuperSkip(newState, context.userId, helpers);

      case 'invert':
        return executeReverse(newState, context.userId, helpers);

      case 'commit_alter_future':
        return executeCommitAlterFuture(
          newState,
          context.userId,
          typedPayload!.newOrder!,
          helpers,
        );

      default:
        return this.errorResult('Unknown action');
    }
  }

  isGameOver(state: CriticalState): boolean {
    const alivePlayers = state.players.filter((p) => p.alive);
    return alivePlayers.length <= 1;
  }

  getWinners(state: CriticalState): string[] {
    if (!this.isGameOver(state)) {
      return [];
    }

    const alivePlayers = state.players.filter((p) => p.alive);
    return alivePlayers.map((p) => p.playerId);
  }

  sanitizeStateForPlayer(
    state: CriticalState,
    playerId: string,
  ): Partial<CriticalState> {
    return sanitizeCriticalStateForPlayer(state, playerId);
  }

  getAvailableActions(state: CriticalState, playerId: string): string[] {
    return getAvailableActionsForPlayer(
      state,
      playerId,
      this.isPlayerTurn(state, playerId),
    );
  }

  removePlayer(
    state: CriticalState,
    playerId: string,
  ): GameActionResult<CriticalState> {
    const newState = this.cloneState(state);
    const player = this.findPlayer(newState, playerId) as CriticalPlayerState;

    if (!player) {
      return this.errorResult('Player not found');
    }

    player.alive = false;
    this.addLog(
      newState,
      this.createLogEntry('system', `Player left the game`, {
        scope: 'all',
        senderId: playerId,
      }),
    );

    if (this.isPlayerTurn(newState, playerId)) {
      this.advanceTurn(newState);
    }

    return this.successResult(newState);
  }

  protected advanceTurn(state: CriticalState): void {
    const playerCount = state.playerOrder.length;
    const direction = state.playDirection ?? 1;

    // Calculate next index respecting play direction
    let nextIndex =
      (state.currentTurnIndex + direction + playerCount) % playerCount;

    // Skip eliminated players
    let attempts = 0;
    while (attempts < playerCount) {
      const nextPlayerId = state.playerOrder[nextIndex];
      const nextPlayer = state.players.find((p) => p.playerId === nextPlayerId);
      if (nextPlayer?.alive) {
        break;
      }
      nextIndex = (nextIndex + direction + playerCount) % playerCount;
      attempts++;
    }

    state.currentTurnIndex = nextIndex;
    state.pendingDraws = 1;
  }
}
