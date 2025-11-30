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

/**
 * Exploding Cats Game Engine
 * Implements all game logic for Exploding Cats
 */
@Injectable()
export class ExplodingCatsEngine extends BaseGameEngine<ExplodingCatsState> {
  getMetadata(): GameMetadata {
    return {
      gameId: 'exploding_cats_v1',
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
    config?: Record<string, any>,
  ): ExplodingCatsState {
    return createInitialExplodingCatsState(playerIds);
  }

  validateAction(
    state: ExplodingCatsState,
    action: string,
    context: GameActionContext,
    payload?: any,
  ): boolean {
    const player = this.findPlayer(state, context.userId);
    if (!player || !player.alive) {
      return false;
    }

    if (!this.isPlayerTurn(state, context.userId)) {
      return false;
    }

    switch (action) {
      case 'draw_card':
        return state.pendingDraws > 0;

      case 'play_card':
        return this.validatePlayCard(state, context.userId, payload?.card);

      case 'play_cat_combo':
        return this.validateCatCombo(state, context.userId, payload?.cards);

      case 'see_the_future':
        return this.hasCard(player, 'see_the_future');

      case 'favor':
        return this.validateFavor(state, context.userId, payload);

      case 'defuse':
        return this.hasCard(player, 'defuse') && payload?.position !== undefined;

      default:
        return false;
    }
  }

  executeAction(
    state: ExplodingCatsState,
    action: string,
    context: GameActionContext,
    payload?: any,
  ): GameActionResult<ExplodingCatsState> {
    // Auto-fix legacy state where pendingDraws is 0 at start of turn
    if (action === 'draw_card' && state.pendingDraws === 0 && this.isPlayerTurn(state, context.userId)) {
      state.pendingDraws = 1;
    }

    if (!this.validateAction(state, action, context, payload)) {
      return this.errorResult('Invalid action');
    }

    const newState = this.cloneState(state);

    switch (action) {
      case 'draw_card':
        return this.executeDrawCard(newState, context.userId);

      case 'play_card':
        return this.executePlayCard(newState, context.userId, payload.card);

      case 'play_cat_combo':
        return this.executeCatCombo(newState, context.userId, payload.cards, payload.targetPlayerId);

      case 'see_the_future':
        return this.executeSeeTheFuture(newState, context.userId);

      case 'favor':
        return this.executeFavor(newState, context.userId, payload);

      case 'defuse':
        return this.executeDefuse(newState, context.userId, payload.position);

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
    sanitized.deck = new Array(state.deck.length).fill('hidden' as ExplodingCatsCard);

    return sanitized;
  }

  getAvailableActions(state: ExplodingCatsState, playerId: string): string[] {
    const player = this.findPlayer(state, playerId);
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
      if (this.hasCard(player, 'see_the_future')) actions.push('see_the_future');
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
    const player = this.findPlayer(newState, playerId);

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

  private hasCard(player: ExplodingCatsPlayerState, card: ExplodingCatsCard): boolean {
    return player.hand.includes(card);
  }

  private validatePlayCard(state: ExplodingCatsState, playerId: string, card: ExplodingCatsCard): boolean {
    const player = this.findPlayer(state, playerId);
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

  private validateCatCombo(state: ExplodingCatsState, playerId: string, cards: ExplodingCatsCard[]): boolean {
    if (!cards || cards.length < 2) return false;

    const player = this.findPlayer(state, playerId);
    if (!player) return false;

    // All cards must be the same cat card
    const firstCard = cards[0];
    return cards.every((card) => card === firstCard && this.hasCard(player, card));
  }

  private validateFavor(state: ExplodingCatsState, playerId: string, payload: any): boolean {
    const player = this.findPlayer(state, playerId);
    if (!player || !this.hasCard(player, 'favor')) return false;

    if (!payload?.targetPlayerId || !payload?.requestedCard) return false;

    const target = this.findPlayer(state, payload.targetPlayerId);
    return target && target.alive && this.hasCard(target, payload.requestedCard);
  }

  private canPlayCatCombo(player: ExplodingCatsPlayerState): boolean {
    const catCards = ['tacocat', 'hairy_potato_cat', 'rainbow_ralphing_cat', 'cattermelon', 'bearded_cat'];
    return catCards.some((cat) => player.hand.filter((c) => c === cat).length >= 2);
  }

  private executeDrawCard(state: ExplodingCatsState, playerId: string): GameActionResult<ExplodingCatsState> {
    const card = state.deck.shift();

    if (!card) {
      return this.errorResult('Deck is empty');
    }

    const player = this.findPlayer(state, playerId);
    state.pendingDraws--;

    if (card === 'exploding_cat') {
      if (this.hasCard(player, 'defuse')) {
        this.addLog(state, this.createLogEntry('action', `Drew an Exploding Cat!`, { scope: 'all' }));
        // Player must defuse
        return this.successResult(state);
      } else {
        player.alive = false;
        this.addLog(state, this.createLogEntry('system', `Player exploded!`, { scope: 'all' }));
        this.advanceTurn(state);
        return this.successResult(state);
      }
    }

    player.hand.push(card);
    this.addLog(state, this.createLogEntry('action', `Drew a card`, { scope: 'all' }));

    if (state.pendingDraws === 0) {
      this.advanceTurn(state);
    }

    return this.successResult(state);
  }

  private executePlayCard(state: ExplodingCatsState, playerId: string, card: ExplodingCatsCard): GameActionResult<ExplodingCatsState> {
    const player = this.findPlayer(state, playerId);
    const cardIndex = player.hand.indexOf(card);
    player.hand.splice(cardIndex, 1);
    state.discardPile.push(card);

    switch (card) {
      case 'attack':
        this.advanceTurn(state);
        state.pendingDraws = 2;
        this.addLog(state, this.createLogEntry('action', `Played Attack!`, { scope: 'all' }));
        break;

      case 'skip':
        this.advanceTurn(state);
        this.addLog(state, this.createLogEntry('action', `Played Skip`, { scope: 'all' }));
        break;

      case 'shuffle':
        this.shuffleArray(state.deck);
        this.addLog(state, this.createLogEntry('action', `Shuffled the deck`, { scope: 'all' }));
        break;
    }

  return this.successResult(state);
}

protected advanceTurn(state: ExplodingCatsState): void {
  super.advanceTurn(state);
  state.pendingDraws = 1;
}

  private executeCatCombo(
    state: ExplodingCatsState,
    playerId: string,
    cards: ExplodingCatsCard[],
    targetPlayerId: string,
  ): GameActionResult<ExplodingCatsState> {
    const player = this.findPlayer(state, playerId);
    const target = this.findPlayer(state, targetPlayerId);

    if (!target || !target.alive) {
      return this.errorResult('Invalid target');
    }

    // Remove played cards from hand
    cards.forEach((card) => {
      const index = player.hand.indexOf(card);
      if (index !== -1) {
        player.hand.splice(index, 1);
        state.discardPile.push(card);
      }
    });

    this.addLog(
      state,
      this.createLogEntry('action', `Played ${cards.length}x ${cards[0]} combo!`, { scope: 'all' }),
    );

    return this.successResult(state);
  }

  private executeSeeTheFuture(state: ExplodingCatsState, playerId: string): GameActionResult<ExplodingCatsState> {
    const player = this.findPlayer(state, playerId);
    const cardIndex = player.hand.indexOf('see_the_future');
    player.hand.splice(cardIndex, 1);
    state.discardPile.push('see_the_future');

    const topCards = state.deck.slice(0, 3);

    this.addLog(
      state,
      this.createLogEntry('action', `Saw the future: ${topCards.join(', ')}`, {
        scope: 'private',
        senderId: playerId,
      }),
    );

    return this.successResult(state);
  }

  private executeFavor(
    state: ExplodingCatsState,
    playerId: string,
    payload: { targetPlayerId: string; requestedCard: ExplodingCatsCard },
  ): GameActionResult<ExplodingCatsState> {
    const player = this.findPlayer(state, playerId);
    const target = this.findPlayer(state, payload.targetPlayerId);

    // Remove favor card from player
    const favorIndex = player.hand.indexOf('favor');
    player.hand.splice(favorIndex, 1);
    state.discardPile.push('favor');

    // Transfer requested card
    const cardIndex = target.hand.indexOf(payload.requestedCard);
    target.hand.splice(cardIndex, 1);
    player.hand.push(payload.requestedCard);

    this.addLog(
      state,
      this.createLogEntry('action', `Requested a favor`, { scope: 'all' }),
    );

    return this.successResult(state);
  }

  private executeDefuse(
    state: ExplodingCatsState,
    playerId: string,
    position: number,
  ): GameActionResult<ExplodingCatsState> {
    const player = this.findPlayer(state, playerId);

    // Remove defuse card
    const defuseIndex = player.hand.indexOf('defuse');
    player.hand.splice(defuseIndex, 1);
    state.discardPile.push('defuse');

    // Insert exploding cat back into deck at specified position
    state.deck.splice(position, 0, 'exploding_cat');

    this.addLog(
      state,
      this.createLogEntry('action', `Defused an Exploding Cat!`, { scope: 'all' }),
    );

    this.advanceTurn(state);

    return this.successResult(state);
  }
}
