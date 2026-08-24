import {
  HEART_SUIT,
  MOON_SHOOT_POINTS,
  PASS_ROTATION,
  POINTS_HEART,
  POINTS_QUEEN_OF_SPADES,
  QUEEN_OF_SPADES,
  RANKS,
  SUITS,
  TWO_CLUBS,
} from './hearts.constants';
import type { PassDirection, Suit } from './hearts.constants';
import type { TrickPlay } from './hearts.types';

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

export function rankValue(card: string): number {
  const idx = RANKS.indexOf(card.slice(0, -1) as (typeof RANKS)[number]);
  // +2 so ranks map to 2..14 like real card values.
  return idx >= 0 ? idx + 2 : -1;
}

export function suitOf(card: string): Suit | null {
  const suit = card.slice(-1);
  return (SUITS as readonly string[]).includes(suit) ? (suit as Suit) : null;
}

export function isHeartCard(card: string): boolean {
  return card.endsWith(HEART_SUIT);
}

export function isQueenOfSpadesCard(card: string): boolean {
  return card === QUEEN_OF_SPADES;
}

export function isPenaltyCard(card: string): boolean {
  return isHeartCard(card) || isQueenOfSpadesCard(card);
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

/** Pass direction for a hand number (0-based). */
export function passDirectionForHand(handNumber: number): PassDirection {
  return PASS_ROTATION[handNumber % PASS_ROTATION.length];
}

/**
 * Index of the player who receives cards from the player at `senderIndex`.
 * "left" means the next player clockwise in `playerOrder`.
 */
export function receiverIndexOf(
  senderIndex: number,
  direction: PassDirection,
  playerCount: number,
): number {
  switch (direction) {
    case 'left':
      return (senderIndex + 1) % playerCount;
    case 'right':
      return (senderIndex + playerCount - 1) % playerCount;
    case 'across':
      return (senderIndex + Math.floor(playerCount / 2)) % playerCount;
    case 'hold':
      return senderIndex;
  }
}

/** Points carried by a single card. */
export function cardPoints(card: string): number {
  if (isQueenOfSpadesCard(card)) return POINTS_QUEEN_OF_SPADES;
  if (isHeartCard(card)) return POINTS_HEART;
  return 0;
}

/** Total penalty points in a set of taken cards. */
export function pointsInCards(cards: string[]): number {
  return cards.reduce((sum, c) => sum + cardPoints(c), 0);
}

/** Id of the player who wins the trick, or null if incomplete. */
export function trickWinnerId(plays: TrickPlay[]): string | null {
  if (plays.length === 0) return null;
  const leadSuit = suitOf(plays[0].card);
  if (!leadSuit) return null;
  let best = plays[0];
  for (const play of plays.slice(1)) {
    if (
      suitOf(play.card) === leadSuit &&
      rankValue(play.card) > rankValue(best.card)
    ) {
      best = play;
    }
  }
  return best.playerId;
}

/** Player who shot the moon this hand (took all 26 points), or null. */
export function shootTheMoonShooter(
  handScores: Record<string, number>,
): string | null {
  for (const [playerId, points] of Object.entries(handScores)) {
    if (points === MOON_SHOOT_POINTS) return playerId;
  }
  return null;
}

/** Index of the player holding a given card (defaults to 2♣ leader lookup). */
export function holderIndexOf(
  hands: Record<string, string[]>,
  card: string,
  playerOrder: string[],
): number {
  for (const [playerId, hand] of Object.entries(hands)) {
    if (hand.includes(card)) return playerOrder.indexOf(playerId);
  }
  return -1;
}

export function holderOfTwoClubs(
  hands: Record<string, string[]>,
  playerOrder: string[],
): number {
  return holderIndexOf(hands, TWO_CLUBS, playerOrder);
}
