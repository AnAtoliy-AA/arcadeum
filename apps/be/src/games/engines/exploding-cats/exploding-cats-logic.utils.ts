import {
  ExplodingCatsState,
  ExplodingCatsCard,
  ExplodingCatsPlayerState,
} from '../../exploding-cats/exploding-cats.state';
import {
  GameActionResult,
  GameLogEntry,
  ChatScope,
} from '../base/game-engine.interface';
import {
  executePersonalAttack,
  executeAttackOfTheDead,
  executeSuperSkip,
  executeReverse,
} from './exploding-cats-attack.utils';

export { executeNope } from './exploding-cats-nope.utils';

export interface LogEntryOptions {
  scope?: ChatScope;
  senderId?: string | null;
  senderName?: string | null;
}

/**
 * Utility class for Exploding Cats game logic
 * Extracted from ExplodingCatsEngine to reduce file size
 */
export class ExplodingCatsLogic {
  /**
   * Helper to find a player in the state
   */
  static findPlayer(
    state: ExplodingCatsState,
    playerId: string,
  ): ExplodingCatsPlayerState | undefined {
    return state.players.find(
      (p) => p.playerId === playerId,
    ) as ExplodingCatsPlayerState;
  }

  /**
   * Helper to check if a player has a card
   */
  static hasCard(
    player: ExplodingCatsPlayerState,
    card: ExplodingCatsCard,
  ): boolean {
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
      createLogEntry: (
        type: string,
        message: string,
        options?: LogEntryOptions,
      ) => GameLogEntry;
      advanceTurn: (state: ExplodingCatsState) => void;
    },
  ): GameActionResult<ExplodingCatsState> {
    const card = state.deck.shift();

    if (!card) {
      return { success: false, error: 'Deck is empty' };
    }

    const player = this.findPlayer(state, playerId);
    if (!player) return { success: false, error: 'Player not found' };

    // Clear any pending action - drawing finalizes the turn, no more nopes allowed
    state.pendingAction = null;

    state.pendingDraws--;

    if (card === 'exploding_cat') {
      if (this.hasCard(player, 'defuse')) {
        // Player must defuse - set pending defuse state
        state.pendingDefuse = playerId;
        helpers.addLog(
          state,
          helpers.createLogEntry(
            'action',
            `Drew an Exploding Cat! Must play Defuse!`,
            {
              scope: 'all',
            },
          ),
        );
        // Player must defuse - don't advance turn until defuse is played
        return { success: true, state };
      } else {
        player.alive = false;
        helpers.addLog(
          state,
          helpers.createLogEntry('system', `Player exploded!`, {
            scope: 'all',
          }),
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
      createLogEntry: (
        type: string,
        message: string,
        options?: LogEntryOptions,
      ) => GameLogEntry;
      advanceTurn: (state: ExplodingCatsState) => void;
      shuffleArray: <T>(array: T[]) => void;
    },
  ): GameActionResult<ExplodingCatsState> {
    const player = this.findPlayer(state, playerId);
    if (!player) return { success: false, error: 'Player not found' };

    const cardIndex = player.hand.indexOf(card);
    if (cardIndex === -1)
      return { success: false, error: 'Card not found in hand' };

    player.hand.splice(cardIndex, 1);
    state.discardPile.push(card);

    // Clear any previous pending action when a new card is played
    state.pendingAction = null;

    switch (card) {
      // ===== BASE GAME CARDS =====
      case 'attack':
        // Set pending action so it can be noped
        state.pendingAction = {
          type: 'attack',
          playerId,
          nopeCount: 0,
        };
        helpers.advanceTurn(state);
        state.pendingDraws = 2;
        helpers.addLog(
          state,
          helpers.createLogEntry('action', `Played Attack!`, { scope: 'all' }),
        );
        break;

      case 'skip':
        // Set pending action so it can be noped
        state.pendingAction = {
          type: 'skip',
          playerId,
          payload: { previousTurnIndex: state.currentTurnIndex },
          nopeCount: 0,
        };
        // Skip cancels only one pending draw
        state.pendingDraws--;
        if (state.pendingDraws <= 0) {
          helpers.advanceTurn(state);
        }
        helpers.addLog(
          state,
          helpers.createLogEntry('action', `Played Skip`, { scope: 'all' }),
        );
        break;

      case 'shuffle':
        // Set pending action so it can be noped
        state.pendingAction = {
          type: 'shuffle',
          playerId,
          nopeCount: 0,
        };
        helpers.shuffleArray(state.deck);
        helpers.addLog(
          state,
          helpers.createLogEntry('action', `Shuffled the deck`, {
            scope: 'all',
          }),
        );
        break;

      // ===== ATTACK PACK EXPANSION CARDS =====
      case 'reverse':
        // Put card back in hand (executeReverse will remove it)
        player.hand.push(card);
        state.discardPile.pop();
        return executeReverse(state, playerId, helpers);

      case 'super_skip':
        player.hand.push(card);
        state.discardPile.pop();
        return executeSuperSkip(state, playerId, helpers);

      case 'personal_attack':
        player.hand.push(card);
        state.discardPile.pop();
        return executePersonalAttack(state, playerId, helpers);

      case 'attack_of_the_dead':
        player.hand.push(card);
        state.discardPile.pop();
        return executeAttackOfTheDead(state, playerId, helpers);

      default:
        // For unsupported cards, put them back and return error
        player.hand.push(card);
        state.discardPile.pop();
        return { success: false, error: `Card '${card}' is not playable` };
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
      createLogEntry: (
        type: string,
        message: string,
        options?: LogEntryOptions,
      ) => GameLogEntry;
    },
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
      createLogEntry: (
        type: string,
        message: string,
        options?: LogEntryOptions,
      ) => GameLogEntry;
    },
  ): GameActionResult<ExplodingCatsState> {
    const player = this.findPlayer(state, playerId);
    if (!player) return { success: false, error: 'Player not found' };

    const cardIndex = player.hand.indexOf('see_the_future');
    if (cardIndex === -1)
      return { success: false, error: 'See The Future card not found' };

    player.hand.splice(cardIndex, 1);
    state.discardPile.push('see_the_future');

    const topCards = state.deck.slice(0, 3);

    // Public log - just says player used the card (no card reveal)
    helpers.addLog(
      state,
      helpers.createLogEntry('action', `Used See the Future 🔮`, {
        scope: 'all',
        senderId: playerId,
      }),
    );

    // Private log - shows actual cards only to the player who used it
    // Use format "cards:card_type" so frontend can translate
    const cardKeys = topCards.map((card) => `cards:${card}`);
    helpers.addLog(
      state,
      helpers.createLogEntry(
        'action',
        `seeTheFuture.reveal:${cardKeys.join(',')}`,
        {
          scope: 'private',
          senderId: playerId,
        },
      ),
    );

    return { success: true, state };
  }

  /**
   * Execute Favor - Step 1: Player plays favor card, target must give a card
   * Sets pendingFavor state, target player will need to respond with give_favor_card action
   */
  static executeFavor(
    state: ExplodingCatsState,
    playerId: string,
    payload: { targetPlayerId: string },
    helpers: {
      addLog: (state: ExplodingCatsState, entry: GameLogEntry) => void;
      createLogEntry: (
        type: string,
        message: string,
        options?: LogEntryOptions,
      ) => GameLogEntry;
    },
  ): GameActionResult<ExplodingCatsState> {
    const player = this.findPlayer(state, playerId);
    const target = this.findPlayer(state, payload.targetPlayerId);

    if (!player || !target)
      return { success: false, error: 'Player not found' };

    // Check target has cards
    if (target.hand.length === 0)
      return { success: false, error: 'Target has no cards' };

    // Remove favor card from player
    const favorIndex = player.hand.indexOf('favor');
    if (favorIndex === -1)
      return { success: false, error: 'Favor card not found' };

    player.hand.splice(favorIndex, 1);
    state.discardPile.push('favor');

    // Set pending favor - target must now choose a card to give
    state.pendingFavor = {
      requesterId: playerId,
      targetId: payload.targetPlayerId,
    };

    // Set pending action so it can be noped
    state.pendingAction = {
      type: 'favor',
      playerId,
      payload: { targetPlayerId: payload.targetPlayerId },
      nopeCount: 0,
    };

    helpers.addLog(
      state,
      helpers.createLogEntry(
        'action',
        `Requested a favor - waiting for response`,
        { scope: 'all' },
      ),
    );

    return { success: true, state };
  }

  /**
   * Execute Give Favor Card - Step 2: Target gives a card of their choice
   */
  static executeGiveFavorCard(
    state: ExplodingCatsState,
    playerId: string,
    payload: { cardToGive: ExplodingCatsCard },
    helpers: {
      addLog: (state: ExplodingCatsState, entry: GameLogEntry) => void;
      createLogEntry: (
        type: string,
        message: string,
        options?: LogEntryOptions,
      ) => GameLogEntry;
    },
  ): GameActionResult<ExplodingCatsState> {
    if (!state.pendingFavor)
      return { success: false, error: 'No pending favor' };

    if (state.pendingFavor.targetId !== playerId)
      return { success: false, error: 'Not your favor to give' };

    const target = this.findPlayer(state, playerId);
    const requester = this.findPlayer(state, state.pendingFavor.requesterId);

    if (!target || !requester)
      return { success: false, error: 'Player not found' };

    // Check target has the card
    const cardIndex = target.hand.indexOf(payload.cardToGive);
    if (cardIndex === -1) return { success: false, error: 'Card not in hand' };

    // Transfer the card
    target.hand.splice(cardIndex, 1);
    requester.hand.push(payload.cardToGive);

    // Clear pending favor
    state.pendingFavor = null;

    helpers.addLog(
      state,
      helpers.createLogEntry('action', `Gave a card as favor`, {
        scope: 'all',
      }),
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
      createLogEntry: (
        type: string,
        message: string,
        options?: LogEntryOptions,
      ) => GameLogEntry;
      advanceTurn: (state: ExplodingCatsState) => void;
    },
  ): GameActionResult<ExplodingCatsState> {
    const player = this.findPlayer(state, playerId);
    if (!player) return { success: false, error: 'Player not found' };

    // Remove defuse card
    const defuseIndex = player.hand.indexOf('defuse');
    if (defuseIndex === -1)
      return { success: false, error: 'Defuse card not found' };

    player.hand.splice(defuseIndex, 1);
    state.discardPile.push('defuse');

    // Insert exploding cat back into deck at specified position
    state.deck.splice(position, 0, 'exploding_cat');

    // Clear the pending defuse state
    state.pendingDefuse = null;

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
