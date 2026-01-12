import {
  CriticalState,
  CriticalCard,
  CriticalPlayerState,
} from '../../critical/critical.state';
import {
  GameActionResult,
  GameLogEntry,
  ChatScope,
} from '../base/game-engine.interface';
import { FIVER_COMBO_SIZE } from './critical-validation.utils';

export interface LogEntryOptions {
  scope?: ChatScope;
  senderId?: string | null;
  senderName?: string | null;
}

/** Execute cat combo - Pair, Trio, or Fiver */
export function executeCatCombo(
  state: CriticalState,
  playerId: string,
  cards: CriticalCard[],
  targetPlayerId: string | null,
  helpers: {
    addLog: (state: CriticalState, entry: GameLogEntry) => void;
    createLogEntry: (
      type: string,
      message: string,
      options?: LogEntryOptions,
    ) => GameLogEntry;
    findPlayer: (
      state: CriticalState,
      playerId: string,
    ) => CriticalPlayerState | undefined;
  },
  selectedIndex?: number,
  requestedCard?: CriticalCard,
  requestedDiscardCard?: CriticalCard,
): GameActionResult<CriticalState> {
  const player = helpers.findPlayer(state, playerId);
  if (!player) return { success: false, error: 'Player not found' };

  // Fiver combo: FIVER_COMBO_SIZE different cards to pick from discard pile
  if (cards.length === FIVER_COMBO_SIZE) {
    if (!requestedDiscardCard) {
      return {
        success: false,
        error: 'Must specify a card to take from discard pile for fiver combo',
      };
    }
    const discardIndex = state.discardPile.indexOf(requestedDiscardCard);
    if (discardIndex === -1) {
      return {
        success: false,
        error: 'Requested card is not in the discard pile',
      };
    }
    cards.forEach((card) => {
      const index = player.hand.indexOf(card);
      if (index !== -1) {
        player.hand.splice(index, 1);
        state.discardPile.push(card);
      }
    });
    state.discardPile.splice(discardIndex, 1);
    player.hand.push(requestedDiscardCard);
    helpers.addLog(
      state,
      helpers.createLogEntry(
        'action',
        `Played 5 different cards combo and took a ${requestedDiscardCard} from the discard pile!`,
        { scope: 'all', senderId: playerId },
      ),
    );
    return { success: true, state };
  }

  // Pair/Trio combos require a target player
  const target = targetPlayerId
    ? helpers.findPlayer(state, targetPlayerId)
    : null;
  if (!target || !target.alive)
    return { success: false, error: 'Invalid target' };
  if (target.hand.length === 0)
    return { success: false, error: 'Target has no cards to steal' };
  if (cards.length === 2 && selectedIndex === undefined) {
    return {
      success: false,
      error: 'Must select a card position for pair combo',
    };
  }
  if (cards.length >= 3 && !requestedCard) {
    return {
      success: false,
      error: 'Must specify a card to request for trio combo',
    };
  }

  // Remove played cards from hand
  cards.forEach((card) => {
    const index = player.hand.indexOf(card);
    if (index !== -1) {
      player.hand.splice(index, 1);
      state.discardPile.push(card);
    }
  });

  let stolenCard: CriticalCard | null = null;

  if (cards.length === 2 && selectedIndex !== undefined) {
    const clampedIndex = Math.max(
      0,
      Math.min(selectedIndex, target.hand.length - 1),
    );
    stolenCard = target.hand[clampedIndex];
    target.hand.splice(clampedIndex, 1);
    player.hand.push(stolenCard);
    helpers.addLog(
      state,
      helpers.createLogEntry(
        'action',
        `Played ${cards.length}x ${cards[0]} combo and stole a card!`,
        { scope: 'all', senderId: playerId },
      ),
    );
    helpers.addLog(
      state,
      helpers.createLogEntry('action', `stolenCard:cards:${stolenCard}`, {
        scope: 'private',
        senderId: playerId,
      }),
    );
  } else if (cards.length >= 3 && requestedCard) {
    const cardIndex = target.hand.indexOf(requestedCard);
    if (cardIndex !== -1) {
      stolenCard = target.hand[cardIndex];
      target.hand.splice(cardIndex, 1);
      player.hand.push(stolenCard);
      helpers.addLog(
        state,
        helpers.createLogEntry(
          'action',
          `Played ${cards.length}x ${cards[0]} combo and stole a ${requestedCard}!`,
          { scope: 'all', senderId: playerId },
        ),
      );
    } else {
      helpers.addLog(
        state,
        helpers.createLogEntry(
          'action',
          `Played ${cards.length}x ${cards[0]} combo but target didn't have the requested card!`,
          { scope: 'all', senderId: playerId },
        ),
      );
    }
  }

  return { success: true, state };
}
