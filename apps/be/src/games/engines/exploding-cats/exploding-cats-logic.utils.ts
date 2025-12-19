import { 
  ExplodingCatsState, 
  ExplodingCatsCard, 
  ExplodingCatsPlayerState 
} from '../../exploding-cats/exploding-cats.state';
import { GameActionResult, GameLogEntry } from '../base/game-engine.interface';

/**
 * Utility class for Exploding Cats game logic
 * Extracted from ExplodingCatsEngine to reduce file size
 */
export class ExplodingCatsLogic {
  /**
   * Helper to find a player in the state
   */
  static findPlayer(state: ExplodingCatsState, playerId: string): ExplodingCatsPlayerState | undefined {
    return state.players.find((p) => p.playerId === playerId) as ExplodingCatsPlayerState;
  }

  /**
   * Helper to check if a player has a card
   */
  static hasCard(player: ExplodingCatsPlayerState, card: ExplodingCatsCard): boolean {
    return player.hand.includes(card);
  }

  /**
   * Execute drawing a card
   */
  static executeDrawCard(
    state: ExplodingCatsState,
    playerId: string,
    helpers: {
      addLog: (state: ExplodingCatsState, entry: GameLogEntry) => void;
      createLogEntry: (type: string, message: string, options?: any) => GameLogEntry;
      advanceTurn: (state: ExplodingCatsState) => void;
    }
  ): GameActionResult<ExplodingCatsState> {
    const card = state.deck.shift();

    if (!card) {
      return { success: false, error: 'Deck is empty' };
    }

    const player = this.findPlayer(state, playerId);
    if (!player) return { success: false, error: 'Player not found' };

    state.pendingDraws--;

    if (card === 'exploding_cat') {
      if (this.hasCard(player, 'defuse')) {
        helpers.addLog(
          state,
          helpers.createLogEntry('action', `Drew an Exploding Cat!`, {
            scope: 'all',
          }),
        );
        // Player must defuse
        return { success: true, state };
      } else {
        player.alive = false;
        helpers.addLog(
          state,
          helpers.createLogEntry('system', `Player exploded!`, { scope: 'all' }),
        );
        helpers.advanceTurn(state);
        return { success: true, state };
      }
    }

    player.hand.push(card);
    helpers.addLog(
      state,
      helpers.createLogEntry('action', `Drew a card`, { scope: 'all' }),
    );

    if (state.pendingDraws === 0) {
      helpers.advanceTurn(state);
    }

    return { success: true, state };
  }

  /**
   * Execute playing a card
   */
  static executePlayCard(
    state: ExplodingCatsState,
    playerId: string,
    card: ExplodingCatsCard,
    helpers: {
      addLog: (state: ExplodingCatsState, entry: GameLogEntry) => void;
      createLogEntry: (type: string, message: string, options?: any) => GameLogEntry;
      advanceTurn: (state: ExplodingCatsState) => void;
      shuffleArray: (array: any[]) => void;
    }
  ): GameActionResult<ExplodingCatsState> {
    const player = this.findPlayer(state, playerId);
    if (!player) return { success: false, error: 'Player not found' };

    const cardIndex = player.hand.indexOf(card);
    if (cardIndex === -1) return { success: false, error: 'Card not found in hand' };

    player.hand.splice(cardIndex, 1);
    state.discardPile.push(card);

    switch (card) {
      case 'attack':
        helpers.advanceTurn(state);
        state.pendingDraws = 2;
        helpers.addLog(
          state,
          helpers.createLogEntry('action', `Played Attack!`, { scope: 'all' }),
        );
        break;

      case 'skip':
        helpers.advanceTurn(state);
        helpers.addLog(
          state,
          helpers.createLogEntry('action', `Played Skip`, { scope: 'all' }),
        );
        break;

      case 'shuffle':
        helpers.shuffleArray(state.deck);
        helpers.addLog(
          state,
          helpers.createLogEntry('action', `Shuffled the deck`, { scope: 'all' }),
        );
        break;
    }

    return { success: true, state };
  }

  /**
   * Execute cat combo
   */
  static executeCatCombo(
    state: ExplodingCatsState,
    playerId: string,
    cards: ExplodingCatsCard[],
    targetPlayerId: string,
    helpers: {
      addLog: (state: ExplodingCatsState, entry: GameLogEntry) => void;
      createLogEntry: (type: string, message: string, options?: any) => GameLogEntry;
    }
  ): GameActionResult<ExplodingCatsState> {
    const player = this.findPlayer(state, playerId);
    const target = this.findPlayer(state, targetPlayerId);

    if (!player) return { success: false, error: 'Player not found' };
    if (!target || !target.alive) {
      return { success: false, error: 'Invalid target' };
    }

    // Remove played cards from hand
    cards.forEach((card) => {
      const index = player.hand.indexOf(card);
      if (index !== -1) {
        player.hand.splice(index, 1);
        state.discardPile.push(card);
      }
    });

    helpers.addLog(
      state,
      helpers.createLogEntry(
        'action',
        `Played ${cards.length}x ${cards[0]} combo!`,
        { scope: 'all' },
      ),
    );

    return { success: true, state };
  }

  /**
   * Execute See The Future
   */
  static executeSeeTheFuture(
    state: ExplodingCatsState,
    playerId: string,
    helpers: {
      addLog: (state: ExplodingCatsState, entry: GameLogEntry) => void;
      createLogEntry: (type: string, message: string, options?: any) => GameLogEntry;
    }
  ): GameActionResult<ExplodingCatsState> {
    const player = this.findPlayer(state, playerId);
    if (!player) return { success: false, error: 'Player not found' };

    const cardIndex = player.hand.indexOf('see_the_future');
    if (cardIndex === -1) return { success: false, error: 'See The Future card not found' };

    player.hand.splice(cardIndex, 1);
    state.discardPile.push('see_the_future');

    const topCards = state.deck.slice(0, 3);

    helpers.addLog(
      state,
      helpers.createLogEntry('action', `Saw the future: ${topCards.join(', ')}`, {
        scope: 'private',
        senderId: playerId,
      }),
    );

    return { success: true, state };
  }

  /**
   * Execute Favor
   */
  static executeFavor(
    state: ExplodingCatsState,
    playerId: string,
    payload: { targetPlayerId: string; requestedCard: ExplodingCatsCard },
    helpers: {
      addLog: (state: ExplodingCatsState, entry: GameLogEntry) => void;
      createLogEntry: (type: string, message: string, options?: any) => GameLogEntry;
    }
  ): GameActionResult<ExplodingCatsState> {
    const player = this.findPlayer(state, playerId);
    const target = this.findPlayer(state, payload.targetPlayerId);

    if (!player || !target) return { success: false, error: 'Player not found' };

    // Remove favor card from player
    const favorIndex = player.hand.indexOf('favor');
    if (favorIndex === -1) return { success: false, error: 'Favor card not found' };

    player.hand.splice(favorIndex, 1);
    state.discardPile.push('favor');

    // Transfer requested card
    const cardIndex = target.hand.indexOf(payload.requestedCard);
    if (cardIndex !== -1) {
      target.hand.splice(cardIndex, 1);
      player.hand.push(payload.requestedCard);
    }

    helpers.addLog(
      state,
      helpers.createLogEntry('action', `Requested a favor`, { scope: 'all' }),
    );

    return { success: true, state };
  }

  /**
   * Execute Defuse
   */
  static executeDefuse(
    state: ExplodingCatsState,
    playerId: string,
    position: number,
    helpers: {
      addLog: (state: ExplodingCatsState, entry: GameLogEntry) => void;
      createLogEntry: (type: string, message: string, options?: any) => GameLogEntry;
      advanceTurn: (state: ExplodingCatsState) => void;
    }
  ): GameActionResult<ExplodingCatsState> {
    const player = this.findPlayer(state, playerId);
    if (!player) return { success: false, error: 'Player not found' };

    // Remove defuse card
    const defuseIndex = player.hand.indexOf('defuse');
    if (defuseIndex === -1) return { success: false, error: 'Defuse card not found' };

    player.hand.splice(defuseIndex, 1);
    state.discardPile.push('defuse');

    // Insert exploding cat back into deck at specified position
    state.deck.splice(position, 0, 'exploding_cat');

    helpers.addLog(
      state,
      helpers.createLogEntry('action', `Defused an Exploding Cat!`, {
        scope: 'all',
      }),
    );

    helpers.advanceTurn(state);

    return { success: true, state };
  }
}
