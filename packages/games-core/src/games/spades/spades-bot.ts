import {
  GAME_PHASE,
  MAX_BID,
  NIL_BID,
} from './spades.constants';
import type { SpadesState } from './spades.types';
import { rankValue, suitOf, partnerOf } from './spades.utils';
import { randomInt } from '../../lib/random';

type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Framework-agnostic Spades bot decision logic (bidding and card play).
 */
export class SpadesBot {
  /** The bot whose turn it is to bid or play, or null. */
  currentActorId(state: SpadesState): string | null {
    return state.playerOrder[state.currentTurnIndex] ?? null;
  }

  // ----------------------------------------------------------------- bidding

  pickBid(state: SpadesState, botId: string): number {
    const hand = state.hands[botId] ?? [];
    const sureWinners = countSureWinners(hand);

    if (this.difficultyOf(state) === 'easy') {
      // Random-ish but still spade-aware so easy bots stay plausible.
      return Math.max(1, Math.min(MAX_BID, sureWinners + randomInt(3)));
    }

    // Nil is attractive with a flat hand: few or no sure winners and no
    // dangerous aces/kings outside spades.
    if (state.options.nilEnabled && sureWinners <= 1 && nilIsSafe(hand)) {
      return NIL_BID;
    }
    return Math.max(1, Math.min(MAX_BID, sureWinners));
  }

  // ----------------------------------------------------------------- playing

  pickCardToPlay(state: SpadesState, botId: string): string | null {
    const hand = state.hands[botId] ?? [];
    const legal = this.legalCards(state, botId, hand);
    if (legal.length === 0) return hand[0] ?? null;
    if (this.difficultyOf(state) === 'easy')
      return legal[randomInt(legal.length)];

    const plays = state.currentTrick.plays;
    const byRankAsc = (cards: string[]) =>
      [...cards].sort((a, b) => rankValue(a) - rankValue(b));

    if (plays.length === 0) {
      return this.pickLead(legal, hand);
    }

    const leadSuit = state.currentTrick.leadSuit;
    const inSuit =
      leadSuit !== null ? legal.filter((c) => suitOf(c) === leadSuit) : [];
    const partnerId = partnerOf(state.playerOrder, botId);
    const winningPlay = currentWinningPlay(plays);
    const partnerWinning = winningPlay?.playerId === partnerId;

    // Follow suit when possible.
    if (inSuit.length > 0) {
      const sorted = byRankAsc(inSuit);
      if (partnerWinning) return sorted[0]; // duck — partner has it
      const winners = winningPlay
        ? sorted.filter((c) => beats(c, winningPlay.card))
        : sorted;
      return winners[0] ?? sorted[0]; // cheapest winner, else duck low
    }

    // Void in the led suit.
    const spades = legal.filter((c) => suitOf(c) === 'S');
    if (!partnerWinning && spades.length > 0 && winningPlay) {
      const winners = spades
        .filter((c) => beats(c, winningPlay.card))
        .sort((a, b) => rankValue(a) - rankValue(b));
      if (winners.length > 0 && trickHasHighCard(winningPlay.card)) {
        return winners[0]; // trump in cheaply over a strong card
      }
    }
    // Discard the lowest non-spade; keep spade control.
    const nonSpades = legal.filter((c) => suitOf(c) !== 'S');
    return byRankAsc(nonSpades.length > 0 ? nonSpades : legal)[0];
  }

  protected pickLead(legal: string[], hand: string[]): string {
    const spades = legal.filter((c) => suitOf(c) === 'S');
    const nonSpades = legal.filter((c) => suitOf(c) !== 'S');

    // With a deep spade run, draw out opponents' trumps using the top.
    const spadeCount = hand.filter((c) => suitOf(c) === 'S').length;
    if (spadeCount >= 5 && spades.length > 0) {
      return [...spades].sort((a, b) => rankValue(b) - rankValue(a))[0];
    }

    // Otherwise lead low from the longest non-spade suit.
    if (nonSpades.length > 0) {
      const bySuit = new Map<string, string[]>();
      for (const card of nonSpades) {
        const suit = suitOf(card) ?? 'C';
        bySuit.set(suit, [...(bySuit.get(suit) ?? []), card]);
      }
      let longest: string[] = [];
      for (const cards of bySuit.values()) {
        if (cards.length > longest.length) longest = cards;
      }
      return [...longest].sort((a, b) => rankValue(a) - rankValue(b))[0];
    }
    return [...legal].sort((a, b) => rankValue(a) - rankValue(b))[0];
  }

  /**
   * Legal cards for a player given follow-suit / broken-spades rules
   * (mirrors the engine validators without mutating state).
   */
  legalCards(state: SpadesState, botId: string, hand?: string[]): string[] {
    const h = hand ?? state.hands[botId] ?? [];
    const plays = state.currentTrick.plays;
    const leading = plays.length === 0;

    if (leading) {
      if (!state.spadesBroken) {
        const nonSpades = h.filter((c) => suitOf(c) !== 'S');
        if (nonSpades.length > 0) return nonSpades;
      }
      return [...h];
    }

    const leadSuit = state.currentTrick.leadSuit;
    const inSuit = h.filter((c) => c.endsWith(leadSuit ?? ''));
    if (leadSuit && inSuit.length > 0) return inSuit;
    return [...h];
  }

  protected difficultyOf(state: SpadesState): Difficulty {
    const d = state.options.aiDifficulty;
    if (d === 'easy') return 'easy';
    // AI-vs-AI rooms request 'expert' (no per-game expert strategy exists
    // for spades) — play the strongest available strategy instead.
    return d === 'hard' || d === 'expert' ? 'hard' : 'medium';
  }
}

/** Aces and bare kings/queens of side suits plus top spades are "sure" tricks. */
function countSureWinners(hand: string[]): number {
  const spades = hand
    .filter((c) => suitOf(c) === 'S')
    .sort((a, b) => rankValue(b) - rankValue(a));
  let winners = 0;
  // Top spades that outrank every missing spade are guaranteed tricks.
  const missingHighSpades = ['AS', 'KS', 'QS'].filter((c) => !hand.includes(c));
  for (const card of spades) {
    const beaten = missingHighSpades.some(
      (m) => rankValue(m) > rankValue(card),
    );
    if (!beaten) winners += 1;
    else break;
  }
  for (const card of hand) {
    if (suitOf(card) === 'S') continue;
    if (rankValue(card) === 14)
      winners += 1; // ace
    else if (rankValue(card) === 13) winners += 0.5; // guarded king maybe
  }
  return Math.round(winners);
}

/** Nil is safe with no aces/kings and at most a couple of mid spades. */
function nilIsSafe(hand: string[]): boolean {
  return (
    !hand.some((c) => rankValue(c) >= 13 && suitOf(c) !== 'S') &&
    hand.filter((c) => suitOf(c) === 'S' && rankValue(c) >= 11).length === 0
  );
}

/** Play currently winning the trick, or null before any card is down. */
function currentWinningPlay(plays: Array<{ playerId: string; card: string }>) {
  if (plays.length === 0) return null;
  const spades = plays.filter((p) => p.card.endsWith('S'));
  const pool = spades.length > 0 ? spades : plays;
  const leadSuit = plays[0].card.slice(-1);
  const candidates =
    spades.length > 0
      ? pool
      : pool.filter((p) => p.card.slice(-1) === leadSuit);
  return candidates.reduce((best, p) =>
    rankValue(p.card) > rankValue(best.card) ? p : best,
  );
}

/** Whether `card` beats `other` under spades-trump rules. */
function beats(card: string, other: string): boolean {
  const cardIsSpade = card.endsWith('S');
  const otherIsSpade = other.endsWith('S');
  if (cardIsSpade !== otherIsSpade) return cardIsSpade;
  return rankValue(card) > rankValue(other);
}

/** A trick containing an ace or king of the led suit is worth contesting. */
function trickHasHighCard(card: string): boolean {
  return rankValue(card) >= 13;
}
