import { RANKS, SUITS, SPADE_SUIT } from './spades.constants';
import type { Suit, TeamSide } from './spades.constants';
import type { TrickPlay } from './spades.types';

export type DeckShuffler = <T>(cards: T[]) => T[];

export function makeDeck(): string[] {
  const deck: string[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(`${rank}${suit}`);
    }
  }
  return deck;
}

/** Rank mapped to 2..14. */
export function rankValue(card: string): number {
  const idx = RANKS.indexOf(card.slice(0, -1) as (typeof RANKS)[number]);
  return idx >= 0 ? idx + 2 : -1;
}

export function suitOf(card: string): Suit | null {
  const suit = card.slice(-1);
  return (SUITS as readonly string[]).includes(suit) ? (suit as Suit) : null;
}

export function isSpadeCard(card: string): boolean {
  return card.endsWith(SPADE_SUIT);
}

/** Sort a hand: clubs → diamonds → spades → hearts, ascending rank. */
export function sortHand(hand: string[]): string[] {
  return [...hand].sort((a, b) => {
    const sa = SUITS.indexOf(suitOf(a) ?? 'C');
    const sb = SUITS.indexOf(suitOf(b) ?? 'C');
    if (sa !== sb) return sa - sb;
    return rankValue(a) - rankValue(b);
  });
}

/** Team side of the player seated at `playerIndex`. */
export function sideOf(playerIndex: number): TeamSide {
  return playerIndex % 2 === 0 ? 'even' : 'odd';
}

export function sideOfPlayer(
  playerOrder: string[],
  playerId: string,
): TeamSide {
  return sideOf(Math.max(0, playerOrder.indexOf(playerId)));
}

/** Ids of both players on a team side, in seating order. */
export function teamMembers(
  playerOrder: string[],
  side: TeamSide,
): [string, string] {
  const members = playerOrder.filter(
    (_, idx) => sideOf(idx) === side,
  ) as unknown as [string, string];
  return members;
}

/** The partner (teammate) id of `playerId`, or null when absent. */
export function partnerOf(
  playerOrder: string[],
  playerId: string,
): string | null {
  const idx = playerOrder.indexOf(playerId);
  if (idx < 0) return null;
  return playerOrder[(idx + 2) % playerOrder.length] ?? null;
}

/**
 * Winner of a completed trick: highest spade wins if any spade was played,
 * otherwise the highest card of the led suit. Null when the trick is empty.
 */
export function trickWinnerId(plays: TrickPlay[]): string | null {
  if (plays.length === 0) return null;
  const spades = plays.filter((p) => isSpadeCard(p.card));
  if (spades.length > 0) {
    return spades.reduce((best, p) =>
      rankValue(p.card) > rankValue(best.card) ? p : best,
    ).playerId;
  }
  const leadSuit = suitOf(plays[0].card);
  if (!leadSuit) return null;
  const inSuit = plays.filter((p) => suitOf(p.card) === leadSuit);
  return inSuit.reduce((best, p) =>
    rankValue(p.card) > rankValue(best.card) ? p : best,
  ).playerId;
}
