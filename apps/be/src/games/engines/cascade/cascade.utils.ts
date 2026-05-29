import { randomUUID } from 'crypto';
import { ACTIVE_COLORS, COLORS, type ActiveColor } from './cascade.constants';
import type { CascadeCard } from './cascade.types';

/**
 * Build a fresh 108-card Cascade deck:
 *   4 colors × 19 number cards (one 0, two each of 1-9) = 76
 *   4 colors × 6 action cards (2× Skip, 2× Reverse, 2× Draw-Two) = 24
 *   4 Wild + 4 Wild Draw-Four = 8
 */
export function buildDeck(): CascadeCard[] {
  const deck: CascadeCard[] = [];
  for (const color of COLORS) {
    // One zero per color
    deck.push(card(color, 'NUMBER', 0));
    // Two of each 1-9 per color
    for (let v = 1; v <= 9; v++) {
      deck.push(card(color, 'NUMBER', v));
      deck.push(card(color, 'NUMBER', v));
    }
    // 2× Skip, 2× Reverse, 2× Draw-Two per color
    deck.push(card(color, 'SKIP'));
    deck.push(card(color, 'SKIP'));
    deck.push(card(color, 'REVERSE'));
    deck.push(card(color, 'REVERSE'));
    deck.push(card(color, 'DRAW_TWO'));
    deck.push(card(color, 'DRAW_TWO'));
  }
  // 4 Wild + 4 Wild Draw-Four
  for (let i = 0; i < 4; i++) {
    deck.push(card('W', 'WILD'));
    deck.push(card('W', 'WILD_DRAW_FOUR'));
  }
  return deck;
}

function card(
  color: CascadeCard['color'],
  kind: CascadeCard['kind'],
  value?: number,
): CascadeCard {
  return {
    id: randomUUID(),
    color,
    kind,
    ...(value !== undefined ? { value } : {}),
  };
}

export function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function isActiveColor(value: unknown): value is ActiveColor {
  return (
    typeof value === 'string' &&
    (ACTIVE_COLORS as ReadonlyArray<string>).includes(value)
  );
}

/**
 * Whether `card` is legal to play onto `top` given the current active color
 * and any pending stack penalty.
 */
export function isPlayable(
  card: CascadeCard,
  topCard: CascadeCard,
  activeColor: ActiveColor,
  pendingDraw: number,
  pendingStackKind: 'DRAW_TWO' | 'WILD_DRAW_FOUR' | null,
): boolean {
  // During a draw-stack, only same-kind stack cards are playable.
  if (pendingDraw > 0 && pendingStackKind) {
    return card.kind === pendingStackKind;
  }
  if (card.kind === 'WILD' || card.kind === 'WILD_DRAW_FOUR') return true;
  if (card.color !== 'W' && card.color === activeColor) return true;
  if (
    card.kind === 'NUMBER' &&
    topCard.kind === 'NUMBER' &&
    card.value === topCard.value
  )
    return true;
  if (
    (card.kind === 'SKIP' ||
      card.kind === 'REVERSE' ||
      card.kind === 'DRAW_TWO') &&
    card.kind === topCard.kind
  )
    return true;
  return false;
}

/**
 * Pick the first non-action, non-wild card to start the discard pile. Falls
 * back to the first card if the deck has no numeric starter (vanishingly
 * unlikely with the standard deck composition).
 */
export function pickStarterIndex(deck: CascadeCard[]): number {
  for (let i = 0; i < deck.length; i++) {
    if (deck[i].kind === 'NUMBER') return i;
  }
  return 0;
}

export function nextIndex(
  current: number,
  length: number,
  direction: 1 | -1,
  skip = 0,
): number {
  if (length === 0) return 0;
  const raw = current + direction * (1 + skip);
  return ((raw % length) + length) % length;
}
