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
import { ExplodingCatsLogic } from './exploding-cats-logic.utils';

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

    if (!this.isPlayerTurn(state, context.userId)) {
      return false;
    }

    const typedPayload = payload as any; // Temporary cast for property access

    switch (action) {
      case 'draw_card':
        return state.pendingDraws > 0;

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

      case 'defuse':
        return (
          this.hasCard(player, 'defuse') && typedPayload?.position !== undefined
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
    const typedPayload = payload as any; // Temporary cast for property access

    const helpers = {
      addLog: this.addLog.bind(this),
      createLogEntry: this.createLogEntry.bind(this),
      advanceTurn: this.advanceTurn.bind(this),
      shuffleArray: this.shuffleArray.bind(this),
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
          typedPayload.card,
          helpers,
        );

      case 'play_cat_combo':
        return ExplodingCatsLogic.executeCatCombo(
          newState,
          context.userId,
          typedPayload.cards,
          typedPayload.targetPlayerId,
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
          typedPayload,
          helpers,
        );

      case 'defuse':
        return ExplodingCatsLogic.executeDefuse(
          newState,
          context.userId,
          typedPayload.position,
          helpers,
        );

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

    // Partially hide deck (show count only)
    sanitized.deck = new Array(state.deck.length).fill(
      'hidden' as ExplodingCatsCard,
    );

    return sanitized;
  }

  getAvailableActions(state: ExplodingCatsState, playerId: string): string[] {
    const player = this.findPlayer(state, playerId) as ExplodingCatsPlayerState;
    if (!player || !player.alive || !this.isPlayerTurn(state, playerId)) {
      return [];
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
    card: ExplodingCatsCard,
  ): boolean {
    const player = this.findPlayer(state, playerId) as ExplodingCatsPlayerState;
    if (!player) return false;

    // Skip and Attack can only be played when you have pending draws (instead of drawing)
    if (card === 'skip' || card === 'attack') {
      return this.hasCard(player, card) && state.pendingDraws > 0;
    }

    // Shuffle can be played anytime during your turn
    if (card === 'shuffle') {
      return this.hasCard(player, card);
    }

    return false;
  }

  private validateCatCombo(
    state: ExplodingCatsState,
    playerId: string,
    cards: ExplodingCatsCard[],
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
    const typedPayload = payload as any;
    const player = this.findPlayer(state, playerId) as ExplodingCatsPlayerState;
    if (!player || !this.hasCard(player, 'favor')) return false;

    if (!typedPayload?.targetPlayerId || !typedPayload?.requestedCard)
      return false;

    const target = this.findPlayer(
      state,
      typedPayload.targetPlayerId,
    ) as ExplodingCatsPlayerState;
    return (
      target && target.alive && this.hasCard(target, typedPayload.requestedCard)
    );
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
    super.advanceTurn(state);
    state.pendingDraws = 1;
  }
}
