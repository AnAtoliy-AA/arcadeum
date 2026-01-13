import {
  CriticalState,
  CriticalCard,
  CriticalPlayerState,
  COLLECTION_CARDS,
  BASE_SPECIAL_CARDS,
  CARDS_REQUIRING_DRAWS,
  ANYTIME_ACTION_CARDS,
} from '../../critical/critical.state';

/**
 * Validation utilities for Critical game actions
 */

/** Number of different cards required for the fiver combo */
export const FIVER_COMBO_SIZE = 5;

interface FavorPayload {
  targetPlayerId?: string;
}

interface GiveFavorCardPayload {
  cardToGive?: CriticalCard;
}

export function hasCard(
  player: CriticalPlayerState,
  card: CriticalCard,
): boolean {
  return player.hand.includes(card);
}

export function validatePlayCard(
  state: CriticalState,
  player: CriticalPlayerState | null,
  card?: CriticalCard,
): boolean {
  if (!card || !player) return false;

  // Check cards that require pending draws (Skip, Attack, Shuffle, etc.)
  if (CARDS_REQUIRING_DRAWS.includes(card)) {
    return hasCard(player, card) && state.pendingDraws > 0;
  }

  // Cancel can be played anytime (if valid context)
  if (ANYTIME_ACTION_CARDS.includes(card)) {
    return hasCard(player, card);
  }

  return false;
}

export function validateCollectionCombo(
  player: CriticalPlayerState | null,
  cards?: CriticalCard[],
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

  // If action card combos are allowed, we just need to ensure it's not a special card (like critical_event)
  if (allowActionCardCombos) {
    return !BASE_SPECIAL_CARDS.includes(
      firstCard as (typeof BASE_SPECIAL_CARDS)[number],
    );
  }

  // Otherwise, strictly require it to be a COLLECTION_CASE
  return COLLECTION_CARDS.includes(
    firstCard as (typeof COLLECTION_CARDS)[number],
  );
}

export function validateFavor(
  state: CriticalState,
  player: CriticalPlayerState | null,
  target: CriticalPlayerState | null,
  payload: unknown,
): boolean {
  const typedPayload = payload as FavorPayload | undefined;
  if (!player || !hasCard(player, 'trade')) return false;

  // Can't play favor if there's a pending favor waiting
  if (state.pendingFavor) return false;
  if (!typedPayload?.targetPlayerId) return false;

  // Target must be alive and have at least one card
  return target !== null && target.alive && target.hand.length > 0;
}

export function validateGiveFavorCard(
  state: CriticalState,
  playerId: string,
  player: CriticalPlayerState | null,
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

export function canPlayCollectionCombo(
  player: CriticalPlayerState,
  allowActionCardCombos = false,
): boolean {
  // Check collection cards for combo availability
  const hasCollectionCombo = COLLECTION_CARDS.some(
    (cat) => player.hand.filter((c) => c === cat).length >= 2,
  );

  if (hasCollectionCombo) return true;

  // If action card combos are enabled, check for any matching pairs
  if (allowActionCardCombos) {
    // Cards that can be used for combos (exclude special cards like critical_event and neutralizer)
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

export function canPlayFiverCombo(player: CriticalPlayerState): boolean {
  // Check if player has at least FIVER_COMBO_SIZE different cards
  const uniqueCards = new Set(player.hand);
  return uniqueCards.size >= FIVER_COMBO_SIZE;
}

export function getAvailableActionsForPlayer(
  state: CriticalState,
  playerId: string,
  isTurn: boolean,
): string[] {
  const player = state.players.find((p) => p.playerId === playerId);
  if (!player || !player.alive || !isTurn) {
    return [];
  }

  // If player must defuse, that's the only available action
  if (state.pendingDefuse === playerId) {
    return ['neutralizer'];
  }

  const actions: string[] = [];

  if (state.pendingDraws > 0) {
    actions.push('draw_card');
  } else {
    // Standard cards
    if (hasCard(player, 'strike')) actions.push('play_card:strike');
    if (hasCard(player, 'evade')) actions.push('play_card:evade');
    if (hasCard(player, 'reorder')) actions.push('play_card:reorder');
    if (hasCard(player, 'insight')) actions.push('insight');
    if (hasCard(player, 'trade')) actions.push('trade');

    // Attack Pack
    if (hasCard(player, 'targeted_strike'))
      actions.push('play_card:targeted_strike');
    if (hasCard(player, 'private_strike'))
      actions.push('play_card:private_strike');
    if (hasCard(player, 'recursive_strike'))
      actions.push('play_card:recursive_strike');
    if (hasCard(player, 'mega_evade')) actions.push('play_card:mega_evade');
    if (hasCard(player, 'invert')) actions.push('play_card:invert');

    // Future Pack
    if (hasCard(player, 'see_future_5x'))
      actions.push('play_card:see_future_5x');
    if (hasCard(player, 'alter_future_3x'))
      actions.push('play_card:alter_future_3x');
    if (hasCard(player, 'alter_future_5x'))
      actions.push('play_card:alter_future_5x');
    if (hasCard(player, 'reveal_future_3x'))
      actions.push('play_card:reveal_future_3x');
    if (hasCard(player, 'share_future_3x'))
      actions.push('play_card:share_future_3x');
    if (hasCard(player, 'draw_bottom')) actions.push('play_card:draw_bottom');
    if (hasCard(player, 'swap_top_bottom'))
      actions.push('play_card:swap_top_bottom');
    if (hasCard(player, 'bury')) actions.push('play_card:bury');

    // Can play collection combos
    if (canPlayCollectionCombo(player, state.allowActionCardCombos))
      actions.push('play_cat_combo');
  }

  return actions;
}
