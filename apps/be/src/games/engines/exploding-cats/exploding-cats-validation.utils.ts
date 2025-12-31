import {
  ExplodingCatsState,
  ExplodingCatsCard,
  ExplodingCatsPlayerState,
} from '../../exploding-cats/exploding-cats.state';

/**
 * Validation utilities for Exploding Cats game actions
 */

interface FavorPayload {
  targetPlayerId?: string;
}

interface GiveFavorCardPayload {
  cardToGive?: ExplodingCatsCard;
}

export function hasCard(
  player: ExplodingCatsPlayerState,
  card: ExplodingCatsCard,
): boolean {
  return player.hand.includes(card);
}

export function validatePlayCard(
  state: ExplodingCatsState,
  player: ExplodingCatsPlayerState | null,
  card?: ExplodingCatsCard,
): boolean {
  if (!card || !player) return false;

  // Skip and Attack can only be played when you have pending draws
  if (card === 'skip' || card === 'attack') {
    return hasCard(player, card) && state.pendingDraws > 0;
  }

  // Shuffle and Nope can be played anytime during your turn
  if (card === 'shuffle' || card === 'nope') {
    return hasCard(player, card);
  }

  return false;
}

export function validateCatCombo(
  player: ExplodingCatsPlayerState | null,
  cards?: ExplodingCatsCard[],
): boolean {
  if (!cards || cards.length < 2 || !player) return false;

  // All cards must be the same cat card
  const firstCard = cards[0];
  return cards.every((card) => card === firstCard && hasCard(player, card));
}

export function validateFavor(
  state: ExplodingCatsState,
  player: ExplodingCatsPlayerState | null,
  target: ExplodingCatsPlayerState | null,
  payload: unknown,
): boolean {
  const typedPayload = payload as FavorPayload | undefined;
  if (!player || !hasCard(player, 'favor')) return false;

  // Can't play favor if there's a pending favor waiting
  if (state.pendingFavor) return false;
  if (!typedPayload?.targetPlayerId) return false;

  // Target must be alive and have at least one card
  return target !== null && target.alive && target.hand.length > 0;
}

export function validateGiveFavorCard(
  state: ExplodingCatsState,
  playerId: string,
  player: ExplodingCatsPlayerState | null,
  payload: unknown,
): boolean {
  // Must have a pending favor targeting this player
  if (!state.pendingFavor || state.pendingFavor.targetId !== playerId) {
    return false;
  }

  const typedPayload = payload as GiveFavorCardPayload | undefined;
  if (!typedPayload?.cardToGive) return false;

  if (!player || !player.alive) return false;

  // Must have the card to give
  return player.hand.includes(typedPayload.cardToGive);
}

export function canPlayCatCombo(player: ExplodingCatsPlayerState): boolean {
  const catCards = [
    'tacocat',
    'hairy_potato_cat',
    'rainbow_ralphing_cat',
    'cattermelon',
    'bearded_cat',
  ];
  return catCards.some(
    (cat) => player.hand.filter((c) => c === cat).length >= 2,
  );
}
