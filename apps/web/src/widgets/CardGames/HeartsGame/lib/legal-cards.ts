import type { HeartsClientState } from '../types';

export const QUEEN_OF_SPADES = 'QS';
export const TWO_OF_CLUBS = '2C';

/** Number of tricks completed in the current hand (`taken` resets per deal). */
export function completedTrickCount(snapshot: HeartsClientState): number {
  const takenCards = Object.values(snapshot.taken).reduce(
    (sum, cards) => sum + cards.length,
    0,
  );
  return Math.floor(takenCards / 4);
}

function isHeart(card: string): boolean {
  return card.endsWith('H');
}

function isPenalty(card: string): boolean {
  return isHeart(card) || card === QUEEN_OF_SPADES;
}

/**
 * Client-side mirror of the engine's play validators: which cards in `hand`
 * may legally be played right now. Purely advisory — the server remains
 * authoritative — but lets the UI disable illegal cards up front.
 */
export function legalCardIds(
  snapshot: HeartsClientState,
  hand: string[],
): string[] {
  if (snapshot.phase !== 'playing') return [];
  const plays = snapshot.currentTrick.plays;
  const leading = plays.length === 0;
  const isFirstTrick = completedTrickCount(snapshot) === 0;

  if (leading) {
    if (isFirstTrick) {
      return hand.includes(TWO_OF_CLUBS) ? [TWO_OF_CLUBS] : [...hand];
    }
    if (!snapshot.heartsBroken) {
      const nonHearts = hand.filter((c) => !isHeart(c));
      if (nonHearts.length > 0) return nonHearts;
    }
    return [...hand];
  }

  const leadSuit = snapshot.currentTrick.leadSuit;
  if (leadSuit) {
    const inSuit = hand.filter((c) => c.endsWith(leadSuit));
    if (inSuit.length > 0) return inSuit;
    if (isFirstTrick) {
      const safe = hand.filter((c) => !isPenalty(c));
      if (safe.length > 0) return safe;
    }
  }
  return [...hand];
}
