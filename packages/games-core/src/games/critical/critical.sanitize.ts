import type { CriticalCard } from './critical.constants';
import type { CriticalState } from './critical.state';

/**
 * Strip server-only state before pushing a snapshot to a client.
 *
 * - Replaces every other player's hand + stash with `'hidden'` masks so
 *   one player can't read another's cards from devtools.
 * - Hides the deck entirely (or partially when `pendingAlter` is active
 *   for the player — they're allowed to peek at the top N).
 * - Reveals face-up `critical_implosion` positions so clients can render
 *   the warning marker without revealing the rest of the deck.
 * - Filters logs by scope: `all` and undefined → public; `players` →
 *   game participants only; `private` → sender only.
 * - Populates `overloadOdds` and `criticalsRemaining` so the ThreatStrip
 *   can render an exact percentage and "△ N left" tail instead of its
 *   visible-cards-only estimate.
 */
export function sanitizeCriticalStateForPlayer(
  state: CriticalState,
  playerId: string,
): Partial<CriticalState> {
  const sanitized = JSON.parse(JSON.stringify(state)) as CriticalState;

  // Check if player is an actual game participant
  const isPlayer = sanitized.players.some((p) => p.playerId === playerId);

  // Hide other players' hands OR hide own hand if blind (Blackout)
  sanitized.players = sanitized.players.map((p) => {
    if (p.playerId === playerId && !p.isBlind) {
      return p; // Show full hand to the player
    }
    return {
      ...p,
      hand: p.hand.map(() => 'hidden' as CriticalCard), // Hide hand cards
      stash: p.stash.map(() => 'hidden' as CriticalCard), // Hide stashed cards
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
  // If pendingAlter, show the top N cards to the active player
  if (state.pendingAlter && state.pendingAlter.playerId === playerId) {
    const count = state.pendingAlter.count;
    sanitized.deck = [
      ...state.deck.slice(0, count),
      ...new Array<CriticalCard>(Math.max(0, state.deck.length - count)).fill(
        'hidden' as CriticalCard,
      ),
    ];
  } else {
    sanitized.deck = new Array<CriticalCard>(state.deck.length).fill(
      'hidden' as CriticalCard,
    );

    // If Critical Implosion is face up, reveal its position in the deck
    if (state.implosionState?.isFaceUp) {
      state.deck.forEach((card, index) => {
        if (card === 'critical_implosion' && index < sanitized.deck.length) {
          sanitized.deck[index] = 'critical_implosion';
        }
      });
    }
  }

  // Server-authoritative draw-elimination odds. Counts `critical_event`
  // always; face-up `critical_implosion` is an instant-eliminate so it
  // joins the count when armed. Bottom-half implosion (not face-up) is
  // not yet dangerous, so it's excluded — drawing it just flips it.
  if (state.deck.length === 0) {
    sanitized.overloadOdds = null;
    sanitized.criticalsRemaining = null;
  } else {
    const implosionArmed = !!state.implosionState?.isFaceUp;
    const criticals = state.deck.filter(
      (c) =>
        c === 'critical_event' ||
        (implosionArmed && c === 'critical_implosion'),
    ).length;
    sanitized.overloadOdds = Math.round((criticals / state.deck.length) * 100);
    sanitized.criticalsRemaining = criticals;
  }

  return sanitized;
}
