import {
  CriticalState,
  CriticalCard,
  CriticalPlayerState,
  COLLECTION_CARDS,
  BASE_SPECIAL_CARDS,
  CARDS_REQUIRING_DRAWS,
  ANYTIME_ACTION_CARDS,
} from '../../critical/critical.state';
import { GameActionContext } from '../base/game-engine.interface';

// Payload interfaces
export interface PlayCardPayload {
  card?: CriticalCard;
}

export interface PlayCollectionComboPayload {
  cards?: CriticalCard[];
  targetPlayerId?: string;
  selectedIndex?: number;
  requestedCard?: CriticalCard;
  requestedDiscardCard?: CriticalCard;
}

export interface FavorPayload {
  targetPlayerId?: string;
}

export type FavorExecutePayload = Required<FavorPayload>;

export interface GiveFavorCardPayload {
  cardToGive?: CriticalCard;
}

export interface DefusePayload {
  position?: number;
}

export interface CommitAlterFuturePayload {
  newOrder?: CriticalCard[];
}

export interface TheftPackPayload {
  cardsToStash?: CriticalCard[];
  cardsToUnstash?: CriticalCard[];
}

export type CriticalPayload = PlayCardPayload &
  PlayCollectionComboPayload &
  FavorPayload &
  GiveFavorCardPayload &
  DefusePayload &
  CommitAlterFuturePayload &
  TheftPackPayload;

/**
 * Validation utilities for Critical game actions
 */

/** Number of different cards required for the fiver combo */
export const FIVER_COMBO_SIZE = 5;

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
    // CRITICAL FIX: Ensure critical_event from Containment Field cannot be played
    if (
      card === 'critical_implosion' ||
      (card as string) === 'critical_event'
    ) {
      return false;
    }
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

    // Theft Pack
    if (hasCard(player, 'mark')) actions.push('play_card:mark');
    if (hasCard(player, 'steal_draw')) actions.push('play_card:steal_draw');
    if (hasCard(player, 'stash')) actions.push('play_card:stash');
    // Note: wildcard is used in combos, not played directly

    // Can play collection combos
    if (canPlayCollectionCombo(player, state.allowActionCardCombos))
      actions.push('play_cat_combo');
  }

  return actions;
}

export function validateCriticalAction(
  state: CriticalState,
  action: string,
  context: GameActionContext,
  payload?: unknown,
): boolean {
  const player = state.players.find(
    (p) => p.playerId === context.userId,
  ) as CriticalPlayerState;

  if (!player || !player.alive) {
    return false;
  }

  // give_favor_card can be done by target player even when not their turn
  if (action === 'give_favor_card') {
    const typedPayload = payload as CriticalPayload | undefined;
    return validateGiveFavorCard(state, context.userId, player, typedPayload);
  }

  // play_cancel can be played by ANY alive player when there's a pending action
  if (action === 'play_cancel') {
    // Must have a pending action to cancel
    if (!state.pendingAction) return false;
    // Must have a cancel card
    return hasCard(player, 'cancel');
  }

  // Exception: play_card with 'cancel' acts like play_cancel
  const checkPayload = payload as CriticalPayload | undefined;
  if (action === 'play_card' && checkPayload?.card === 'cancel') {
    if (!state.pendingAction) return false;
    return hasCard(player, 'cancel');
  }

  // All other actions require it to be the player's turn
  const isTurn = state.playerOrder[state.currentTurnIndex] === context.userId;
  if (!isTurn) {
    return false;
  }

  // If there's a pending favor, block all other actions until it's resolved
  // The current player must wait for the opponent to give a card
  if (state.pendingFavor) {
    return false;
  }

  // If pending Alter the Future, block substantially everything except commit
  // commit_alter_future is handled below separately/explicitly if needed, or we just check here.
  if (state.pendingAlter && action !== 'commit_alter_future') {
    return false;
  }

  // If player must defuse, only allow neutralizer action
  if (state.pendingDefuse === context.userId && action !== 'neutralizer') {
    return false;
  }

  const typedPayload = payload as CriticalPayload | undefined;

  switch (action) {
    case 'draw_card':
      // Can't draw if must defuse
      if (state.pendingDefuse) return false;
      // Always allow draw when it's player's turn (checked above)
      return true;

    case 'play_card': {
      const card = typedPayload?.card;
      if (
        card === 'mark' ||
        card === 'steal_draw' ||
        card === 'stash' ||
        (card as string) === 'unstash'
      ) {
        return validateCriticalAction(
          state,
          (card || 'unstash') as string,
          context,
          payload,
        );
      }
      return validatePlayCard(state, player, card);
    }

    case 'play_cat_combo':
      return validateCollectionCombo(
        player,
        typedPayload?.cards,
        state.allowActionCardCombos,
      );

    case 'insight':
      return hasCard(player, 'insight');

    case 'trade': {
      const target = typedPayload?.targetPlayerId
        ? (state.players.find(
            (p) => p.playerId === typedPayload.targetPlayerId,
          ) as CriticalPlayerState)
        : null;
      return validateFavor(state, player, target, typedPayload);
    }

    case 'give_favor_card':
      return validateGiveFavorCard(state, context.userId, player, typedPayload);

    case 'neutralizer':
      // Can only defuse if pendingDefuse is set for this player
      return (
        state.pendingDefuse === context.userId &&
        hasCard(player, 'neutralizer') &&
        typedPayload?.position !== undefined
      );

    // Attack Pack cards
    case 'targeted_strike':
      return (
        hasCard(player, 'targeted_strike') &&
        state.pendingDraws > 0 &&
        !!typedPayload?.targetPlayerId
      );

    case 'private_strike':
      return hasCard(player, 'private_strike') && state.pendingDraws > 0;

    case 'recursive_strike':
      return hasCard(player, 'recursive_strike') && state.pendingDraws > 0;

    case 'mega_evade':
      return hasCard(player, 'mega_evade') && state.pendingDraws > 0;

    case 'invert':
      return hasCard(player, 'invert') && state.pendingDraws > 0;

    // Theft Pack
    case 'mark':
      return (
        hasCard(player, 'mark') &&
        state.pendingDraws > 0 &&
        !!typedPayload?.targetPlayerId
      );

    case 'steal_draw':
      return (
        hasCard(player, 'steal_draw') &&
        state.pendingDraws > 0 &&
        !!typedPayload?.targetPlayerId
      );

    case 'stash':
      return (
        hasCard(player, 'stash') &&
        state.pendingDraws > 0 &&
        !!typedPayload?.cardsToStash &&
        typedPayload.cardsToStash.length > 0 &&
        typedPayload.cardsToStash.length <= 3
      );

    case 'unstash':
      return (
        !!player.stash &&
        player.stash.length > 0 &&
        !!typedPayload?.cardsToUnstash &&
        typedPayload.cardsToUnstash.length > 0
      );

    // Future Pack
    case 'commit_alter_future':
      return (
        !!state.pendingAlter &&
        state.pendingAlter?.playerId === context.userId &&
        !!typedPayload?.newOrder
      );

    default:
      return false;
  }
}
