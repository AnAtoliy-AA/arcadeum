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
  createInitialExplodingCatsState,
} from '../../exploding-cats/exploding-cats.state';
import { ExplodingCatsLogic, executeNope } from './exploding-cats-logic.utils';

// Payload interfaces for type-safe action handling
interface PlayCardPayload {
  card?: ExplodingCatsCard;
}

interface PlayCatComboPayload {
  cards?: ExplodingCatsCard[];
  targetPlayerId?: string;
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

  initializeState(playerIds: string[]): ExplodingCatsState {
    return createInitialExplodingCatsState(playerIds);
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
      return this.validateGiveFavorCard(state, context.userId, typedPayload);
    }

    // play_nope can be played by ANY alive player when there's a pending action
    if (action === 'play_nope') {
      // Must have a pending action to nope
      if (!state.pendingAction) return false;
      // Must have a nope card
      return this.hasCard(player, 'nope');
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
        return this.validatePlayCard(state, context.userId, typedPayload?.card);

      case 'play_cat_combo':
        return this.validateCatCombo(
          state,
          context.userId,
          typedPayload?.cards,
        );

      case 'see_the_future':
        return this.hasCard(player, 'see_the_future');

      case 'favor':
        return this.validateFavor(state, context.userId, typedPayload);

      case 'give_favor_card':
        return this.validateGiveFavorCard(state, context.userId, typedPayload);

      case 'defuse':
        // Can only defuse if pendingDefuse is set for this player
        return (
          state.pendingDefuse === context.userId &&
          this.hasCard(player, 'defuse') &&
          typedPayload?.position !== undefined
        );

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
        );

      case 'see_the_future':
        return ExplodingCatsLogic.executeSeeTheFuture(
          newState,
          context.userId,
          helpers,
        );

      case 'favor':
        return ExplodingCatsLogic.executeFavor(
          newState,
          context.userId,
          typedPayload as FavorExecutePayload,
          helpers,
        );

      case 'give_favor_card':
        return ExplodingCatsLogic.executeGiveFavorCard(
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
      if (this.hasCard(player, 'attack')) actions.push('play_card:attack');
      if (this.hasCard(player, 'skip')) actions.push('play_card:skip');
      if (this.hasCard(player, 'shuffle')) actions.push('play_card:shuffle');
      if (this.hasCard(player, 'see_the_future'))
        actions.push('see_the_future');
      if (this.hasCard(player, 'favor')) actions.push('favor');

      // Can play cat combos
      if (this.canPlayCatCombo(player)) actions.push('play_cat_combo');
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

  // ========== Private Helper Methods ==========

  private hasCard(
    player: ExplodingCatsPlayerState,
    card: ExplodingCatsCard,
  ): boolean {
    return player.hand.includes(card);
  }

  private validatePlayCard(
    state: ExplodingCatsState,
    playerId: string,
    card?: ExplodingCatsCard,
  ): boolean {
    if (!card) return false;
    const player = this.findPlayer(state, playerId) as ExplodingCatsPlayerState;
    if (!player) return false;

    // Skip and Attack can only be played when you have pending draws (instead of drawing)
    if (card === 'skip' || card === 'attack') {
      return this.hasCard(player, card) && state.pendingDraws > 0;
    }

    // Shuffle and Nope can be played anytime during your turn
    if (card === 'shuffle' || card === 'nope') {
      return this.hasCard(player, card);
    }

    return false;
  }

  private validateCatCombo(
    state: ExplodingCatsState,
    playerId: string,
    cards?: ExplodingCatsCard[],
  ): boolean {
    if (!cards || cards.length < 2) return false;

    const player = this.findPlayer(state, playerId) as ExplodingCatsPlayerState;
    if (!player) return false;

    // All cards must be the same cat card
    const firstCard = cards[0];
    return cards.every(
      (card) => card === firstCard && this.hasCard(player, card),
    );
  }

  private validateFavor(
    state: ExplodingCatsState,
    playerId: string,
    payload: unknown,
  ): boolean {
    const typedPayload = payload as FavorPayload | undefined;
    const player = this.findPlayer(state, playerId) as ExplodingCatsPlayerState;
    if (!player || !this.hasCard(player, 'favor')) return false;

    // Can't play favor if there's a pending favor waiting
    if (state.pendingFavor) return false;

    if (!typedPayload?.targetPlayerId) return false;

    const target = this.findPlayer(
      state,
      typedPayload.targetPlayerId,
    ) as ExplodingCatsPlayerState;
    // Target must be alive and have at least one card
    return target && target.alive && target.hand.length > 0;
  }

  private validateGiveFavorCard(
    state: ExplodingCatsState,
    playerId: string,
    payload: unknown,
  ): boolean {
    // Must have a pending favor targeting this player
    if (!state.pendingFavor || state.pendingFavor.targetId !== playerId) {
      return false;
    }

    const typedPayload = payload as GiveFavorCardPayload | undefined;
    if (!typedPayload?.cardToGive) return false;

    const player = this.findPlayer(state, playerId) as ExplodingCatsPlayerState;
    if (!player || !player.alive) return false;

    // Must have the card to give
    return player.hand.includes(typedPayload.cardToGive);
  }

  private canPlayCatCombo(player: ExplodingCatsPlayerState): boolean {
    const catCards = [
      'tacocat',
      'hairy_potato_cat',
      'rainbow_ralphing_cat',
      'cattermelon',
      'bearded_cat',
    ];
    return catCards.some(
      (cat) => player.hand.filter((c) => c === cat).length >= 2,
    );
  }

  protected advanceTurn(state: ExplodingCatsState): void {
    const playerCount = state.playerOrder.length;
    let nextIndex = (state.currentTurnIndex + 1) % playerCount;

    // Skip eliminated players
    let attempts = 0;
    while (attempts < playerCount) {
      const nextPlayerId = state.playerOrder[nextIndex];
      const nextPlayer = state.players.find((p) => p.playerId === nextPlayerId);
      if (nextPlayer?.alive) {
        break;
      }
      nextIndex = (nextIndex + 1) % playerCount;
      attempts++;
    }

    state.currentTurnIndex = nextIndex;
    state.pendingDraws = 1;
  }
}
