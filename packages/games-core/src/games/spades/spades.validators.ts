import { GAME_PHASE, MAX_BID, MIN_BID, NIL_BID } from './spades.constants';
import type { SpadesState } from './spades.types';
import { isSpadeCard, suitOf } from './spades.utils';

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

const ok: ValidationResult = { ok: true };
const fail = (error: string): ValidationResult => ({ ok: false, error });

function payloadHas<K extends string>(
  payload: unknown,
  key: K,
): payload is Record<K, unknown> {
  return typeof payload === 'object' && payload !== null && key in payload;
}

export function validateBid(
  state: SpadesState,
  userId: string,
  payload: unknown,
): ValidationResult {
  if (state.phase !== GAME_PHASE.BIDDING) {
    return fail('Bidding phase is over');
  }
  if (state.playerOrder[state.currentTurnIndex] !== userId) {
    return fail('Not your turn to bid');
  }
  if (!payloadHas(payload, 'amount') || typeof payload.amount !== 'number') {
    return fail('amount is required');
  }
  const amount = payload.amount;
  if (!Number.isInteger(amount)) {
    return fail('Bid must be a whole number');
  }
  if (amount < NIL_BID || amount > MAX_BID) {
    return fail(`Bid must be between ${MIN_BID} and ${MAX_BID}`);
  }
  if (amount === NIL_BID && !state.options.nilEnabled) {
    return fail('Nil bids are disabled for this game');
  }
  if ((state.bids[userId] ?? null) !== null) {
    return fail('You have already bid');
  }
  return ok;
}

/** Number of completed tricks in the current hand (`taken` resets per deal). */
export function completedTricks(state: SpadesState): number {
  return (
    Object.values(state.taken).reduce((sum, t) => sum + t.length, 0) /
    4 /* cards per trick */
  );
}

export function validatePlayCard(
  state: SpadesState,
  userId: string,
  payload: unknown,
): ValidationResult {
  if (state.phase !== GAME_PHASE.PLAYING) {
    return fail('Not in the playing phase');
  }
  if (state.playerOrder[state.currentTurnIndex] !== userId) {
    return fail('Not your turn');
  }
  if (!payloadHas(payload, 'card') || typeof payload.card !== 'string') {
    return fail('card is required');
  }
  const card = payload.card;
  const hand = state.hands[userId] ?? [];
  if (!hand.includes(card)) {
    return fail(`Card not in your hand: ${card}`);
  }

  const plays = state.currentTrick.plays;
  const leading = plays.length === 0;

  if (leading) {
    // Spades cannot lead until broken — unless the hand holds only spades.
    if (!state.spadesBroken && isSpadeCard(card)) {
      const onlySpades = hand.every(isSpadeCard);
      if (!onlySpades) {
        return fail('Spades have not been broken yet');
      }
    }
    return ok;
  }

  const leadSuit = state.currentTrick.leadSuit;
  if (leadSuit) {
    const hasLeadSuit = hand.some((c) => suitOf(c) === leadSuit);
    if (hasLeadSuit && suitOf(card) !== leadSuit) {
      return fail(`Must follow suit (${leadSuit})`);
    }
  }

  return ok;
}

export function validateForfeit(
  state: SpadesState,
  userId: string,
): ValidationResult {
  if (state.phase === GAME_PHASE.GAME_OVER) {
    return fail('Game is already over');
  }
  if (!state.players.some((p) => p.playerId === userId)) {
    return fail('Player not in game');
  }
  return ok;
}
