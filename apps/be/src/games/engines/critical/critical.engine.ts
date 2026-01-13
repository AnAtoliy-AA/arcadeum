import { Injectable } from '@nestjs/common';
import { BaseGameEngine } from '../base/base-game-engine.abstract';
import {
  GameMetadata,
  GameActionResult,
  GameActionContext,
} from '../base/game-engine.interface';
import {
  CriticalState,
  CriticalCard,
  CriticalPlayerState,
  CriticalExpansion,
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
  hasCard,
  validatePlayCard,
  validateCollectionCombo,
  validateFavor,
  validateGiveFavorCard,
  getAvailableActionsForPlayer,
} from './critical-validation.utils';
import { executeFavor, executeGiveFavorCard } from './critical-favor.utils';
import {
  executeCommitAlterFuture,
  dispatchFuturePackAction,
} from './critical-future.utils';

// Payload interfaces for type-safe action handling
interface PlayCardPayload {
  card?: CriticalCard;
}

interface PlayCollectionComboPayload {
  cards?: CriticalCard[];
  targetPlayerId?: string;
  selectedIndex?: number; // For pair combos - blind pick a card position
  requestedCard?: CriticalCard; // For trio combos - name a card to steal
  requestedDiscardCard?: CriticalCard; // For fiver combos - pick from discard pile
}

interface FavorPayload {
  targetPlayerId?: string;
}

// Type with required fields for executing favor action
type FavorExecutePayload = Required<FavorPayload>;

interface GiveFavorCardPayload {
  cardToGive?: CriticalCard;
}

interface DefusePayload {
  position?: number;
}

interface CommitAlterFuturePayload {
  newOrder?: CriticalCard[];
}

type CriticalPayload = PlayCardPayload &
  PlayCollectionComboPayload &
  FavorPayload &
  GiveFavorCardPayload &
  DefusePayload &
  CommitAlterFuturePayload;

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
    return createInitialCriticalState(
      playerIds,
      expansions,
      allowActionCardCombos,
    );
  }

  validateAction(
    state: CriticalState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): boolean {
    const player = this.findPlayer(
      state,
      context.userId,
    ) as CriticalPlayerState;

    if (!player || !player.alive) {
      return false;
    }

    // give_favor_card can be done by target player even when not their turn
    if (action === 'give_favor_card') {
      const typedPayload = payload as CriticalPayload | undefined;
      return validateGiveFavorCard(state, context.userId, player, typedPayload);
    }

    // play_cancel can be played by ANY alive player when there's a pending action
    if (action === 'play_cancel') {
      // Must have a pending action to cancel
      if (!state.pendingAction) return false;
      // Must have a cancel card
      return hasCard(player, 'cancel');
    }

    // Exception: play_card with 'cancel' acts like play_cancel
    const checkPayload = payload as CriticalPayload | undefined;
    if (action === 'play_card' && checkPayload?.card === 'cancel') {
      if (!state.pendingAction) return false;
      return hasCard(player, 'cancel');
    }

    // All other actions require it to be the player's turn
    if (!this.isPlayerTurn(state, context.userId)) {
      return false;
    }

    // If there's a pending favor, block all other actions until it's resolved
    // The current player must wait for the opponent to give a card
    if (state.pendingFavor) {
      return false;
    }

    // If pending Alter the Future, block substantially everything except commit
    // commit_alter_future is handled below separately/explicitly if needed, or we just check here.
    if (state.pendingAlter && action !== 'commit_alter_future') {
      return false;
    }

    // If player must defuse, only allow neutralizer action
    if (state.pendingDefuse === context.userId && action !== 'neutralizer') {
      return false;
    }

    const typedPayload = payload as CriticalPayload | undefined;

    switch (action) {
      case 'draw_card':
        // Can't draw if must defuse
        if (state.pendingDefuse) return false;
        // Always allow draw when it's player's turn (checked above)
        // executeAction will auto-fix pendingDraws to 1 if it's 0
        return true;

      case 'play_card':
        return validatePlayCard(state, player, typedPayload?.card);

      case 'play_cat_combo':
        return validateCollectionCombo(
          player,
          typedPayload?.cards,
          state.allowActionCardCombos,
        );

      case 'insight':
        return hasCard(player, 'insight');

      case 'trade': {
        const target = typedPayload?.targetPlayerId
          ? (this.findPlayer(
              state,
              typedPayload.targetPlayerId,
            ) as CriticalPlayerState)
          : null;
        return validateFavor(state, player, target, typedPayload);
      }

      case 'give_favor_card':
        return validateGiveFavorCard(
          state,
          context.userId,
          player,
          typedPayload,
        );

      case 'neutralizer':
        // Can only defuse if pendingDefuse is set for this player
        return (
          state.pendingDefuse === context.userId &&
          hasCard(player, 'neutralizer') &&
          typedPayload?.position !== undefined
        );

      // Attack Pack cards
      case 'targeted_strike':
        return (
          hasCard(player, 'targeted_strike') &&
          state.pendingDraws > 0 &&
          !!typedPayload?.targetPlayerId
        );

      case 'private_strike':
        return hasCard(player, 'private_strike') && state.pendingDraws > 0;

      case 'recursive_strike':
        return hasCard(player, 'recursive_strike') && state.pendingDraws > 0;

      case 'mega_evade':
        return hasCard(player, 'mega_evade') && state.pendingDraws > 0;

      case 'invert':
        return hasCard(player, 'invert') && state.pendingDraws > 0;

      // Future Pack
      case 'commit_alter_future':
        return (
          !!state.pendingAlter &&
          state.pendingAlter?.playerId === context.userId &&
          !!typedPayload?.newOrder
        );

      default:
        return false;
    }
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
          const futurePackResult = dispatchFuturePackAction(
            newState,
            context.userId,
            card,
            helpers,
          );
          if (futurePackResult) {
            return futurePackResult;
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
