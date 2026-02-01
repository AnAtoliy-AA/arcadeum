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

/**
 * Dispatcher for all Chaos Pack cards.
 */
export function dispatchChaosPackAction(
  state: CriticalState,
  playerId: string,
  card: CriticalCard,
  targetPlayerId: string | undefined, // For blackout
  helpers: EngineHelpers,
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
    case 'fission':
      playCard();
      return executeFission(state, playerId, helpers);
    case 'tribute':
      playCard();
      return executeTribute(state, playerId, helpers);
    case 'blackout':
      if (!targetPlayerId) {
        return { success: false, error: 'Target required for Blackout' };
      }
      playCard();
      return executeBlackout(state, playerId, targetPlayerId, helpers);
    default:
      return null;
  }
}

/**
 * Execute Fission (Catomic Bomb)
 * Remove criticals, shuffle deck, place criticals on top. End turn without drawing.
 */
export function executeFission(
  state: CriticalState,
  playerId: string,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  // Extract all critical events (bombs)
  const criticals: CriticalCard[] = [];
  const others: CriticalCard[] = [];

  state.deck.forEach((c) => {
    if (c === 'critical_event' || c === 'critical_implosion') {
      criticals.push(c);
    } else {
      others.push(c);
    }
  });

  // Shuffle others
  helpers.shuffleArray(others);

  // Reassemble: Criticals on TOP (index 0), then others
  // Wait, index 0 is TOP?
  // In `draw_card`, we use `state.deck.shift()`. Yes, index 0 is top.
  state.deck = [...criticals, ...others];

  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `Played Fission: Deck shuffled, Criticals moved to top!`,
      {
        scope: 'all',
        senderId: playerId,
      },
    ),
  );

  // End turn without drawing
  state.pendingDraws = 0;
  helpers.advanceTurn(state);

  return { success: true, state };
}

/**
 * Execute Tribute (Potluck)
 * For MVP: Everyone puts a random card from hand onto Deck.
 */
export function executeTribute(
  state: CriticalState,
  playerId: string,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  const players = state.players.filter((p) => p.alive && p.hand.length > 0);

  players.forEach((p) => {
    const randIdx = Math.floor(Math.random() * p.hand.length);
    const card = p.hand.splice(randIdx, 1)[0];
    state.deck.unshift(card); // Place on top
  });

  helpers.addLog(
    state,
    helpers.createLogEntry(
      'action',
      `Played Tribute: Everyone donated a card to the deck!`,
      {
        scope: 'all',
        senderId: playerId,
      },
    ),
  );

  return { success: true, state };
}

/**
 * Execute Blackout (Curse of Cat Butt)
 * Target player becomes blind.
 */
export function executeBlackout(
  state: CriticalState,
  playerId: string,
  targetId: string,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  const target = helpers.findPlayer(state, targetId);
  if (!target) return { success: false, error: 'Target not found' };

  target.isBlind = true;

  helpers.addLog(
    state,
    helpers.createLogEntry('action', `Played Blackout on ${targetId}!`, {
      scope: 'all',
      senderId: playerId,
    }),
  );

  return { success: true, state };
}
