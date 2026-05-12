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
  kind?: string;
  scope?: ChatScope;
  senderId?: string | null;
  senderName?: string | null;
  targetId?: string | null;
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
  dispatchCard?: (
    state: CriticalState,
    playerId: string,
    card: CriticalCard,
    targetPlayerId?: string,
  ) => GameActionResult<CriticalState> | null;
}

/** Cards that cannot be re-executed via echo */
const ECHO_FORBIDDEN = [
  'echo',
  'critical_event',
  'critical_implosion',
  'neutralizer',
] as const;
type EchoForbiddenCard = (typeof ECHO_FORBIDDEN)[number];

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
    case 'scramble':
      playCard();
      return executeScramble(state, playerId, helpers);
    case 'echo': {
      // Capture top of discard BEFORE adding echo to discard pile
      const topDiscard = state.discardPile[state.discardPile.length - 1];
      if (!topDiscard) return { success: false, error: 'No card to echo' };
      playCard(); // Now echo is on top of discard
      return executeEcho(state, playerId, topDiscard, helpers);
    }
    default:
      return null;
  }
}

/**
 * Execute Echo
 * Re-executes the top card of the discard pile with the same playerId.
 * Cannot echo echo itself, critical_event, or neutralizer.
 */
export function executeEcho(
  state: CriticalState,
  playerId: string,
  cardToEcho: CriticalCard,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  if (ECHO_FORBIDDEN.includes(cardToEcho as EchoForbiddenCard)) {
    return { success: false, error: `Cannot echo ${cardToEcho}` };
  }

  if (!helpers.dispatchCard) {
    return { success: false, error: 'dispatchCard helper not available' };
  }

  const result = helpers.dispatchCard(state, playerId, cardToEcho, undefined);

  if (!result) {
    return { success: false, error: `Card ${cardToEcho} not dispatchable` };
  }

  return result;
}

/**
 * Execute Scramble
 * All alive players simultaneously pass their entire hand to the next player in turn order.
 * Respects playDirection.
 */
export function executeScramble(
  state: CriticalState,
  playerId: string,
  helpers: EngineHelpers,
): GameActionResult<CriticalState> {
  const player = helpers.findPlayer(state, playerId);
  if (!player) return { success: false, error: 'Player not found' };

  const direction = state.playDirection ?? 1;
  const alivePlayers = state.playerOrder
    .map((id) => state.players.find((p) => p.playerId === id))
    .filter((p): p is CriticalPlayerState => !!p && p.alive);

  if (alivePlayers.length < 2) {
    return { success: false, error: 'Not enough players to scramble' };
  }

  // Snapshot hands before mutation
  const handSnapshots = alivePlayers.map((p) => ({
    playerId: p.playerId,
    hand: [...p.hand],
  }));

  // direction=1: player[i] receives from player[(i-1+n)%n]
  // direction=-1: player[i] receives from player[(i+1)%n]
  const n = alivePlayers.length;
  for (let i = 0; i < n; i++) {
    const sourceIndex = (i - direction + n) % n;
    alivePlayers[i].hand = [...handSnapshots[sourceIndex].hand];
  }

  state.pendingAction = {
    type: 'scramble',
    playerId,
    payload: { handSnapshots, direction },
    nopeCount: 0,
  };

  helpers.addLog(
    state,
    helpers.createLogEntry('action', `Played Scramble! All hands rotated!`, {
      scope: 'all',
      senderId: playerId,
    }),
  );

  return { success: true, state };
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
    helpers.createLogEntry('action', `Played Blackout!`, {
      scope: 'all',
      senderId: playerId,
      targetId,
    }),
  );

  return { success: true, state };
}
