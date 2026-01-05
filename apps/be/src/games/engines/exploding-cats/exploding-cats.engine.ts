import { Injectable } from '@nestjs/common';
import { BaseGameEngine } from '../base/base-game-engine.abstract';
import {
  GameMetadata,
  GameActionResult,
  GameActionContext,
} from '../base/game-engine.interface';
import {
  ExplodingCatsState,
  ExplodingCatsCard,
  ExplodingCatsPlayerState,
  ExplodingCatsExpansion,
  createInitialExplodingCatsState,
} from '../../exploding-cats/exploding-cats.state';
import { ExplodingCatsLogic, executeNope } from './exploding-cats-logic.utils';
import {
  executeTargetedAttack,
  executePersonalAttack,
  executeAttackOfTheDead,
  executeSuperSkip,
  executeReverse,
} from './exploding-cats-attack.utils';
import {
  hasCard,
  validatePlayCard,
  validateCatCombo,
  validateFavor,
  validateGiveFavorCard,
  canPlayCatCombo,
} from './exploding-cats-validation.utils';
import {
  executeFavor,
  executeGiveFavorCard,
} from './exploding-cats-favor.utils';

// Payload interfaces for type-safe action handling
interface PlayCardPayload {
  card?: ExplodingCatsCard;
}

interface PlayCatComboPayload {
  cards?: ExplodingCatsCard[];
  targetPlayerId?: string;
  selectedIndex?: number; // For pair combos - blind pick a card position
  requestedCard?: ExplodingCatsCard; // For trio combos - name a card to steal
}

interface FavorPayload {
  targetPlayerId?: string;
}

// Type with required fields for executing favor action
type FavorExecutePayload = Required<FavorPayload>;

interface GiveFavorCardPayload {
  cardToGive?: ExplodingCatsCard;
}

interface DefusePayload {
  position?: number;
}

type ExplodingCatsPayload = PlayCardPayload &
  PlayCatComboPayload &
  FavorPayload &
  GiveFavorCardPayload &
  DefusePayload;

/**
 * Exploding Cats Game Engine
 * Implements all game logic for Exploding Cats
 */
@Injectable()
export class ExplodingCatsEngine extends BaseGameEngine<ExplodingCatsState> {
  getMetadata(): GameMetadata {
    return {
      gameId: 'exploding_kittens_v1',
      name: 'Exploding Cats',
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
  ): ExplodingCatsState {
    const expansions =
      (config?.expansions as ExplodingCatsExpansion[] | undefined) ?? [];
    return createInitialExplodingCatsState(playerIds, expansions);
  }

  validateAction(
    state: ExplodingCatsState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): boolean {
    const player = this.findPlayer(
      state,
      context.userId,
    ) as ExplodingCatsPlayerState;

    if (!player || !player.alive) {
      return false;
    }

    // give_favor_card can be done by target player even when not their turn
    if (action === 'give_favor_card') {
      const typedPayload = payload as ExplodingCatsPayload | undefined;
      return validateGiveFavorCard(state, context.userId, player, typedPayload);
    }

    // play_nope can be played by ANY alive player when there's a pending action
    if (action === 'play_nope') {
      // Must have a pending action to nope
      if (!state.pendingAction) return false;
      // Must have a nope card
      return hasCard(player, 'nope');
    }

    // Exception: play_card with 'nope' acts like play_nope
    const checkPayload = payload as ExplodingCatsPayload | undefined;
    if (action === 'play_card' && checkPayload?.card === 'nope') {
      if (!state.pendingAction) return false;
      return hasCard(player, 'nope');
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

    // If player must defuse, only allow defuse action
    if (state.pendingDefuse === context.userId && action !== 'defuse') {
      return false;
    }

    const typedPayload = payload as ExplodingCatsPayload | undefined;

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
        return validateCatCombo(player, typedPayload?.cards);

      case 'see_the_future':
        return hasCard(player, 'see_the_future');

      case 'favor': {
        const target = typedPayload?.targetPlayerId
          ? (this.findPlayer(
              state,
              typedPayload.targetPlayerId,
            ) as ExplodingCatsPlayerState)
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

      case 'defuse':
        // Can only defuse if pendingDefuse is set for this player
        return (
          state.pendingDefuse === context.userId &&
          hasCard(player, 'defuse') &&
          typedPayload?.position !== undefined
        );

      // Attack Pack cards
      case 'targeted_attack':
        return (
          hasCard(player, 'targeted_attack') &&
          state.pendingDraws > 0 &&
          !!typedPayload?.targetPlayerId
        );

      case 'personal_attack':
        return hasCard(player, 'personal_attack') && state.pendingDraws > 0;

      case 'attack_of_the_dead':
        return hasCard(player, 'attack_of_the_dead') && state.pendingDraws > 0;

      case 'super_skip':
        return hasCard(player, 'super_skip') && state.pendingDraws > 0;

      case 'reverse':
        return hasCard(player, 'reverse') && state.pendingDraws > 0;

      default:
        return false;
    }
  }

  executeAction(
    state: ExplodingCatsState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): GameActionResult<ExplodingCatsState> {
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
    const typedPayload = payload as ExplodingCatsPayload | undefined;

    // Use arrow functions instead of bind() to preserve type safety
    const helpers = {
      addLog: (
        state: ExplodingCatsState,
        log: ReturnType<typeof this.createLogEntry>,
      ) => this.addLog(state, log),
      createLogEntry: this.createLogEntry.bind(
        this,
      ) as typeof this.createLogEntry,
      advanceTurn: (state: ExplodingCatsState) => this.advanceTurn(state),
      shuffleArray: <T>(arr: T[]) => this.shuffleArray(arr),
    };

    switch (action) {
      case 'draw_card':
        return ExplodingCatsLogic.executeDrawCard(
          newState,
          context.userId,
          helpers,
        );

      case 'play_card':
        return ExplodingCatsLogic.executePlayCard(
          newState,
          context.userId,
          typedPayload!.card!,
          helpers,
        );

      case 'play_cat_combo':
        return ExplodingCatsLogic.executeCatCombo(
          newState,
          context.userId,
          typedPayload!.cards!,
          typedPayload!.targetPlayerId!,
          helpers,
          typedPayload?.selectedIndex,
          typedPayload?.requestedCard,
        );

      case 'see_the_future':
        return ExplodingCatsLogic.executeSeeTheFuture(
          newState,
          context.userId,
          helpers,
        );

      case 'favor':
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

      case 'defuse':
        return ExplodingCatsLogic.executeDefuse(
          newState,
          context.userId,
          typedPayload!.position!,
          helpers,
        );

      case 'play_nope':
        return executeNope(newState, context.userId, helpers);

      // ===== ATTACK PACK EXPANSION CARDS =====
      case 'targeted_attack':
        return executeTargetedAttack(
          newState,
          context.userId,
          typedPayload!.targetPlayerId!,
          helpers,
        );

      case 'personal_attack':
        return executePersonalAttack(newState, context.userId, helpers);

      case 'attack_of_the_dead':
        return executeAttackOfTheDead(newState, context.userId, helpers);

      case 'super_skip':
        return executeSuperSkip(newState, context.userId, helpers);

      case 'reverse':
        return executeReverse(newState, context.userId, helpers);

      default:
        return this.errorResult('Unknown action');
    }
  }

  isGameOver(state: ExplodingCatsState): boolean {
    const alivePlayers = state.players.filter((p) => p.alive);
    return alivePlayers.length <= 1;
  }

  getWinners(state: ExplodingCatsState): string[] {
    if (!this.isGameOver(state)) {
      return [];
    }

    const alivePlayers = state.players.filter((p) => p.alive);
    return alivePlayers.map((p) => p.playerId);
  }

  sanitizeStateForPlayer(
    state: ExplodingCatsState,
    playerId: string,
  ): Partial<ExplodingCatsState> {
    const sanitized = this.cloneState(state);

    // Check if player is an actual game participant
    const isPlayer = sanitized.players.some((p) => p.playerId === playerId);

    // Hide other players' hands
    sanitized.players = sanitized.players.map((p) => {
      if (p.playerId === playerId) {
        return p; // Show full hand to the player
      }
      return {
        ...p,
        hand: p.hand.map(() => 'hidden' as ExplodingCatsCard), // Hide cards
      };
    });

    // Filter logs based on scope and player status
    sanitized.logs = sanitized.logs.filter((log) => {
      // Public messages visible to everyone (players + spectators)
      if (log.scope === 'all' || log.scope === undefined) return true;
      // Player-only messages visible only to game participants
      if (log.scope === 'players' && isPlayer) return true;
      // Private messages only visible to sender
      if (log.scope === 'private' && log.senderId === playerId) return true;
      return false;
    });

    // Partially hide deck (show count only)
    sanitized.deck = new Array<ExplodingCatsCard>(state.deck.length).fill(
      'hidden' as ExplodingCatsCard,
    );

    return sanitized;
  }

  getAvailableActions(state: ExplodingCatsState, playerId: string): string[] {
    const player = this.findPlayer(state, playerId) as ExplodingCatsPlayerState;
    if (!player || !player.alive || !this.isPlayerTurn(state, playerId)) {
      return [];
    }

    // If player must defuse, that's the only available action
    if (state.pendingDefuse === playerId) {
      return ['defuse'];
    }

    const actions: string[] = [];

    if (state.pendingDraws > 0) {
      actions.push('draw_card');
    } else {
      // Can play action cards
      if (hasCard(player, 'attack')) actions.push('play_card:attack');
      if (hasCard(player, 'skip')) actions.push('play_card:skip');
      if (hasCard(player, 'shuffle')) actions.push('play_card:shuffle');
      if (hasCard(player, 'see_the_future')) actions.push('see_the_future');
      if (hasCard(player, 'favor')) actions.push('favor');

      // Can play cat combos
      if (canPlayCatCombo(player)) actions.push('play_cat_combo');
    }

    return actions;
  }

  removePlayer(
    state: ExplodingCatsState,
    playerId: string,
  ): GameActionResult<ExplodingCatsState> {
    const newState = this.cloneState(state);
    const player = this.findPlayer(
      newState,
      playerId,
    ) as ExplodingCatsPlayerState;

    if (!player) {
      return this.errorResult('Player not found');
    }

    player.alive = false;
    this.addLog(
      newState,
      this.createLogEntry('system', `Player left the game`, {
        scope: 'all',
      }),
    );

    if (this.isPlayerTurn(newState, playerId)) {
      this.advanceTurn(newState);
    }

    return this.successResult(newState);
  }

  protected advanceTurn(state: ExplodingCatsState): void {
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
