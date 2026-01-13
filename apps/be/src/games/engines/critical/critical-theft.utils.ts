import {
  CriticalState,
  CriticalCard,
  CriticalPlayerState,
  COLLECTION_CARDS,
} from '../../critical/critical.state';
import {
  GameActionResult,
  GameLogEntry,
  ChatScope,
} from '../base/game-engine.interface';

export interface LogEntryOptions {
  scope?: ChatScope;
  senderId?: string | null;
  senderName?: string | null;
}

export interface EngineHelpers {
  addLog: (state: CriticalState, entry: GameLogEntry) => void;
  createLogEntry: (
    type: string,
    message: string,
    options?: LogEntryOptions,
  ) => GameLogEntry;
  advanceTurn: (state: CriticalState) => void;
  shuffleArray: <T>(array: T[]) => void;
  findPlayer: (
    state: CriticalState,
    playerId: string,
  ) => CriticalPlayerState | undefined;
}

// Maximum number of cards that can be stored in stash
const MAX_STASH_SIZE = 3;

/**
 * Dispatcher for all Theft Pack cards.
 * Handles removing the card from the player's hand and routing to the specific executor.
 * Returns null if the card is not a Theft Pack card.
 */
export function dispatchTheftPackAction(
  state: CriticalState,
  playerId: string,
  card: CriticalCard,
  targetPlayerId: string | undefined,
  helpers: EngineHelpers,
  payload?: {
    partnerCard?: CriticalCard; // For wildcard combo
    selectedIndex?: number; // For pair combos
    requestedCard?: CriticalCard; // For trio combos
    cardsToStash?: CriticalCard[]; // For stash action
    cardsToUnstash?: CriticalCard[]; // For unstash action
  },
): GameActionResult<CriticalState> | null {
  const player = state.players.find((p) => p.playerId === playerId);
  if (!player) return null;

  // Helper to remove card and add to discard
  const playCard = () => {
    const idx = player.hand.indexOf(card);
    if (idx > -1) {
      player.hand.splice(idx, 1);
      state.discardPile.push(card);
    }
  };

  switch (card) {
    case 'wildcard':
      // Wildcard is used as part of combos, handled separately
      return null;

    case 'mark':
      if (!targetPlayerId) {
        return { success: false, error: 'Target player required for Mark' };
      }
      playCard();
      return executeMark(state, playerId, targetPlayerId, helpers);

    case 'steal_draw':
      if (!targetPlayerId) {
        return {
          success: false,
          error: 'Target player required for Steal Draw',
        };
      }
      playCard();
      return executeStealDraw(state, playerId, targetPlayerId, helpers);

    case 'stash':
      playCard();
      return executeStash(state, playerId, payload?.cardsToStash, helpers);

    case 'unstash' as CriticalCard:
      return executeUnstash(
        state,
        playerId,
        payload?.cardsToUnstash || [],
        helpers,
      );

    default:
      return null;
  }
}

/**
 * Check if a wildcard can substitute for a collection card in combos
 */
export function isWildcardValidForCombo(
  cards: CriticalCard[],
  wildcardCount: number,
): boolean {
  // Wildcard can substitute for any collection card
  // For pair: 1 wildcard + 1 collection card
  // For trio: 1-2 wildcards + remaining collection cards of same type
  const collectionCards = cards.filter((c) =>
    COLLECTION_CARDS.includes(c as (typeof COLLECTION_CARDS)[number]),
  );
  const wildcards = cards.filter((c) => c === 'wildcard');

  if (wildcards.length !== wildcardCount) return false;
  if (collectionCards.length + wildcards.length < 2) return false;

  // For pair/trio, all collection cards should be the same type
  if (collectionCards.length > 0) {
    const firstCard = collectionCards[0];
    return collectionCards.every((c) => c === firstCard);
  }

  // Only wildcards - valid for any combo
  return true;
}

/**
 * Execute Mark - tag a random card in target's hand to steal later
 */
export function executeMark(
  state: CriticalState,
  playerId: string,
  targetPlayerId: string,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  const target = helpers.findPlayer(state, targetPlayerId);
  if (!target || !target.alive) {
    return { success: false, error: 'Target player not found or eliminated' };
  }

  if (target.hand.length === 0) {
    return { success: false, error: 'Target has no cards to mark' };
  }

  // Initialize markedCards array if not present
  if (!target.markedCards) {
    target.markedCards = [];
  }

  // Pick a random card index to mark
  const randomIndex = Math.floor(Math.random() * target.hand.length);

  // Add mark info
  target.markedCards.push({
    cardIndex: randomIndex,
    markedBy: playerId,
  });

  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `Marked a card in another player's hand 🏷️`,
      {
        scope: 'all',
        senderId: playerId,
      },
    ),
  );

  // Private message to marker showing which card was marked
  const markedCard = target.hand[randomIndex];
  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `mark.reveal:cards:${markedCard}:index:${randomIndex}`,
      {
        scope: 'private',
        senderId: playerId,
      },
    ),
  );

  return { success: true, state };
}

/**
 * Execute Steal Draw - steal the next card a player draws
 */
export function executeStealDraw(
  state: CriticalState,
  playerId: string,
  targetPlayerId: string,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  const target = helpers.findPlayer(state, targetPlayerId);
  if (!target || !target.alive) {
    return { success: false, error: 'Target player not found or eliminated' };
  }

  // Set pending steal on target
  target.pendingStealDraw = playerId;

  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `Played I'll Take That! Next card drawn by target goes to them 🤏`,
      {
        scope: 'all',
        senderId: playerId,
      },
    ),
  );

  return { success: true, state };
}

/**
 * Check if a drawn card should be stolen and handle the steal
 * This should be called during draw_card execution
 */
export function checkAndHandleStealDraw(
  state: CriticalState,
  drawingPlayerId: string,
  drawnCard: CriticalCard,
  helpers: EngineHelpers,
): { stolen: boolean; thief?: string } {
  const player = helpers.findPlayer(state, drawingPlayerId);
  if (!player?.pendingStealDraw) {
    return { stolen: false };
  }

  const thiefId = player.pendingStealDraw;
  const thief = helpers.findPlayer(state, thiefId);

  if (!thief || !thief.alive) {
    // Thief is gone, clear the pending steal
    player.pendingStealDraw = undefined;
    return { stolen: false };
  }

  // Give card to thief instead
  thief.hand.push(drawnCard);

  // Clear the pending steal
  player.pendingStealDraw = undefined;

  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `Stolen! The drawn card went to another player! 🤏`,
      {
        scope: 'all',
        senderId: thiefId,
      },
    ),
  );

  return { stolen: true, thief: thiefId };
}

/**
 * Execute Stash (Tower of Power) - move cards to protected storage
 */
export function executeStash(
  state: CriticalState,
  playerId: string,
  cardsToStash: CriticalCard[] | undefined,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  const player = helpers.findPlayer(state, playerId);
  if (!player) {
    return { success: false, error: 'Player not found' };
  }

  // Initialize stash if not present
  if (!player.stash) {
    player.stash = [];
  }

  // If no cards specified, just activate the stash card (allows future stashing)
  if (!cardsToStash || cardsToStash.length === 0) {
    helpers.addLog(
      state,
      helpers.createLogEntry('action', `Activated Tower of Power! 🏰`, {
        scope: 'all',
        senderId: playerId,
      }),
    );
    return { success: true, state };
  }

  // Validate stash limits
  if (player.stash.length + cardsToStash.length > MAX_STASH_SIZE) {
    return {
      success: false,
      error: `Stash can only hold ${MAX_STASH_SIZE} cards maximum`,
    };
  }

  // Validate player has the cards
  for (const card of cardsToStash) {
    const idx = player.hand.indexOf(card);
    if (idx === -1) {
      return { success: false, error: `You don't have card: ${card}` };
    }
  }

  // Move cards from hand to stash
  for (const card of cardsToStash) {
    const idx = player.hand.indexOf(card);
    if (idx > -1) {
      player.hand.splice(idx, 1);
      player.stash.push(card);
    }
  }

  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `Stashed ${cardsToStash.length} card(s) in Tower of Power 🏰`,
      {
        scope: 'all',
        senderId: playerId,
      },
    ),
  );

  return { success: true, state };
}

/**
 * Execute Unstash - retrieve cards from stash back to hand
 */
export function executeUnstash(
  state: CriticalState,
  playerId: string,
  cardsToRetrieve: CriticalCard[],
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  const player = helpers.findPlayer(state, playerId);
  if (!player) {
    return { success: false, error: 'Player not found' };
  }

  if (!player.stash || player.stash.length === 0) {
    return { success: false, error: 'No cards in stash' };
  }

  // Validate player has the cards in stash
  for (const card of cardsToRetrieve) {
    const idx = player.stash.indexOf(card);
    if (idx === -1) {
      return { success: false, error: `Card not in stash: ${card}` };
    }
  }

  // Move cards from stash to hand
  for (const card of cardsToRetrieve) {
    const idx = player.stash.indexOf(card);
    if (idx > -1) {
      player.stash.splice(idx, 1);
      player.hand.push(card);
    }
  }

  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `Retrieved ${cardsToRetrieve.length} card(s) from stash`,
      {
        scope: 'all',
        senderId: playerId,
      },
    ),
  );

  return { success: true, state };
}

/**
 * Check and handle marked card when a card is played or discarded
 * Call this when cards are removed from a player's hand
 */
export function checkAndHandleMarkedCard(
  state: CriticalState,
  playerId: string,
  cardIndex: number,
  card: CriticalCard,
  helpers: EngineHelpers,
): void {
  const player = helpers.findPlayer(state, playerId);
  if (!player?.markedCards || player.markedCards.length === 0) {
    return;
  }

  // Find if this card index was marked
  const markInfo = player.markedCards.find((m) => m.cardIndex === cardIndex);
  if (!markInfo) {
    return;
  }

  // Remove the mark
  player.markedCards = player.markedCards.filter(
    (m) => m.cardIndex !== cardIndex,
  );

  // Give the card to the marker
  const marker = helpers.findPlayer(state, markInfo.markedBy);
  if (marker && marker.alive) {
    marker.hand.push(card);

    helpers.addLog(
      state,
      helpers.createLogEntry(
        'action',
        `Marked card triggered! Card stolen! 🏷️`,
        {
          scope: 'all',
          senderId: markInfo.markedBy,
        },
      ),
    );
  }

  // Update remaining mark indices (cards after the removed one shift down)
  player.markedCards = player.markedCards.map((m) => ({
    ...m,
    cardIndex: m.cardIndex > cardIndex ? m.cardIndex - 1 : m.cardIndex,
  }));
}
