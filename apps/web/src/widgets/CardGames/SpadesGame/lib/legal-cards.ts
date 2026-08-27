import type { SpadesClientState } from '../types';

export const SPADE_SUIT = 'S';

/** Number of completed tricks in the current hand (`taken` resets per deal). */
export function completedTrickCount(snapshot: SpadesClientState): number {
  const takenCards = Object.values(snapshot.taken).reduce(
    (sum, cards) => sum + cards.length,
    0,
  );
  return Math.floor(takenCards / 4);
}

/**
 * Client-side mirror of the engine's play validators: which cards in `hand`
 * may legally be played right now. Purely advisory — the server remains
 * authoritative — but lets the UI disable illegal cards up front.
 */
export function legalCardIds(
  snapshot: SpadesClientState,
  hand: string[],
): string[] {
  if (snapshot.phase !== 'playing') return [];
  const plays = snapshot.currentTrick.plays;
  const leading = plays.length === 0;

  if (leading) {
    if (!snapshot.spadesBroken) {
      const nonSpades = hand.filter((c) => !c.endsWith(SPADE_SUIT));
      if (nonSpades.length > 0) return nonSpades;
    }
    return [...hand];
  }

  const leadSuit = snapshot.currentTrick.leadSuit;
  if (leadSuit) {
    const inSuit = hand.filter((c) => c.endsWith(leadSuit));
    if (inSuit.length > 0) return inSuit;
  }
  return [...hand];
}
