import {
  ExplodingCatsState,
  ExplodingCatsCard,
  ExplodingCatsPlayerState,
  CAT_CARDS,
  BASE_SPECIAL_CARDS,
} from '../../exploding-cats/exploding-cats.state';

/**
 * Validation utilities for Exploding Cats game actions
 */

/** Number of different cards required for the fiver combo */
export const FIVER_COMBO_SIZE = 5;

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
  if (
    card === 'skip' ||
    card === 'attack' ||
    card === 'targeted_attack' ||
    card === 'attack_of_the_dead' ||
    card === 'personal_attack' ||
    card === 'super_skip' ||
    card === 'reverse'
  ) {
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
  allowActionCardCombos = false,
): boolean {
  if (!cards || cards.length < 2 || !player) return false;

  // Fiver combo: any FIVER_COMBO_SIZE different cards
  if (cards.length === FIVER_COMBO_SIZE) {
    const uniqueCards = new Set(cards);
    // All cards must be different, and player must have them
    return (
      uniqueCards.size === FIVER_COMBO_SIZE &&
      cards.every((c) => hasCard(player, c))
    );
  }

  // Pair/Trio: All cards must be the same card
  const firstCard = cards[0];
  const allSame = cards.every(
    (card) => card === firstCard && hasCard(player, card),
  );

  if (!allSame) return false;

  // If action card combos are allowed, we just need to ensure it's not a special card (like exploding_cat)
  if (allowActionCardCombos) {
    return !BASE_SPECIAL_CARDS.includes(
      firstCard as (typeof BASE_SPECIAL_CARDS)[number],
    );
  }

  // Otherwise, strictly require it to be a CAT_CASE
  return CAT_CARDS.includes(firstCard as (typeof CAT_CARDS)[number]);
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

export function canPlayCatCombo(
  player: ExplodingCatsPlayerState,
  allowActionCardCombos = false,
): boolean {
  // Check cat cards for combo availability
  const hasCatCombo = CAT_CARDS.some(
    (cat) => player.hand.filter((c) => c === cat).length >= 2,
  );

  if (hasCatCombo) return true;

  // If action card combos are enabled, check for any matching pairs
  if (allowActionCardCombos) {
    // Cards that can be used for combos (exclude special cards like exploding_cat and defuse)
    const comboableCards = player.hand.filter(
      (c) =>
        !BASE_SPECIAL_CARDS.includes(c as (typeof BASE_SPECIAL_CARDS)[number]),
    );
    const cardCounts = new Map<string, number>();
    comboableCards.forEach((c) =>
      cardCounts.set(c, (cardCounts.get(c) || 0) + 1),
    );
    return Array.from(cardCounts.values()).some((count) => count >= 2);
  }

  return false;
}

export function canPlayFiverCombo(player: ExplodingCatsPlayerState): boolean {
  // Check if player has at least FIVER_COMBO_SIZE different cards
  const uniqueCards = new Set(player.hand);
  return uniqueCards.size >= FIVER_COMBO_SIZE;
}
