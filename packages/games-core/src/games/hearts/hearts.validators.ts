import {
  CARDS_PER_PASS,
  GAME_PHASE,
  HEART_SUIT,
  TWO_CLUBS,
} from './hearts.constants';
import type { HeartsState } from './hearts.types';
import { isPenaltyCard } from './hearts.utils';

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

const ok: ValidationResult = { ok: true };
const fail = (error: string): ValidationResult => ({ ok: false, error });

function payloadHasCards(payload: unknown): payload is { cards: unknown } {
  return typeof payload === 'object' && payload !== null && 'cards' in payload;
}

function payloadHasCard(payload: unknown): payload is { card: unknown } {
  return typeof payload === 'object' && payload !== null && 'card' in payload;
}

/** Number of completed tricks in the current hand (`taken` resets each deal). */
function completedTricks(state: HeartsState): number {
  return (
    Object.values(state.taken).reduce((sum, t) => sum + t.length, 0) /
    4 /* cards per trick */
  );
}

export function validatePassCards(
  state: HeartsState,
  userId: string,
  payload: unknown,
): ValidationResult {
  if (state.phase !== GAME_PHASE.PASSING) {
    return fail('Passing phase is over');
  }
  if (!state.options.passingEnabled) {
    return fail('Passing is disabled for this game');
  }
  if ((state.pendingPasses[userId] ?? []).length >= CARDS_PER_PASS) {
    return fail('You have already passed your cards');
  }
  if (!payloadHasCards(payload) || !Array.isArray(payload.cards)) {
    return fail('cards array is required');
  }
  const cards: unknown[] = payload.cards;
  if (cards.length !== 3) {
    return fail('You must pass exactly 3 cards');
  }
  const unique = new Set(cards);
  if (unique.size !== cards.length) {
    return fail('Duplicate cards in pass');
  }
  const hand = state.hands[userId] ?? [];
  for (const card of cards) {
    if (typeof card !== 'string') return fail('Invalid card');
    if (!hand.includes(card)) {
      return fail(`Card not in your hand: ${card}`);
    }
  }
  return ok;
}

export function validatePlayCard(
  state: HeartsState,
  userId: string,
  payload: unknown,
): ValidationResult {
  if (state.phase !== GAME_PHASE.PLAYING) {
    return fail('Not in the playing phase');
  }
  if (state.playerOrder[state.currentTurnIndex] !== userId) {
    return fail('Not your turn');
  }
  if (!payloadHasCard(payload) || typeof payload.card !== 'string') {
    return fail('card is required');
  }
  const card = payload.card;
  const hand = state.hands[userId] ?? [];
  if (!hand.includes(card)) {
    return fail(`Card not in your hand: ${card}`);
  }

  const plays = state.currentTrick.plays;
  const leading = plays.length === 0;
  const isFirstTrick = completedTricks(state) === 0;

  // The very first trick of a hand must be led with the 2♣ by its holder.
  if (isFirstTrick && leading && card !== TWO_CLUBS) {
    return fail('The first trick must be led with the 2♣');
  }

  if (leading) {
    // Hearts cannot lead until broken — unless the hand holds only hearts.
    if (!state.heartsBroken && card.endsWith(HEART_SUIT)) {
      const onlyHearts = hand.every((c) => c.endsWith(HEART_SUIT));
      if (!onlyHearts) {
        return fail('Hearts have not been broken yet');
      }
    }
    return ok;
  }

  const leadSuit = state.currentTrick.leadSuit;
  if (leadSuit) {
    const hasLeadSuit = hand.some((c) => c.endsWith(leadSuit));
    if (hasLeadSuit && !card.endsWith(leadSuit)) {
      return fail(`Must follow suit (${leadSuit})`);
    }
    // First trick: a player void in the led suit may not discard a penalty
    // card (heart or Q♠) unless their entire hand is penalty cards.
    if (
      isFirstTrick &&
      !hasLeadSuit &&
      isPenaltyCard(card) &&
      !hand.every(isPenaltyCard)
    ) {
      return fail('No penalty cards on the first trick');
    }
  }

  return ok;
}

export function validateForfeit(
  state: HeartsState,
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
