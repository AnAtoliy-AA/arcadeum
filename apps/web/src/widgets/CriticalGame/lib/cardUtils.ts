import type { CriticalCard } from '../types';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import { THEMATIC_CARD_NAMES } from './constants';

/**
 * Get translation key for a card
 */
export function getCardTranslationKey(
  card: CriticalCard,
  variant?: string,
): TranslationKey {
  if (variant && variant !== 'default') {
    return `games.table.cards.variants.${variant}.${card}` as TranslationKey;
  }

  const keys: Record<string, TranslationKey> = {
    // CORE MECHANICS
    critical_event: 'games.table.cards.criticalEvent',
    neutralizer: 'games.table.cards.neutralizer',
    strike: 'games.table.cards.strike',
    evade: 'games.table.cards.evade',
    trade: 'games.table.cards.trade',
    reorder: 'games.table.cards.reorder',
    insight: 'games.table.cards.insight',
    cancel: 'games.table.cards.cancel',

    // VARIANT-SPECIFIC / COLLECTION CARDS
    collection_alpha: 'games.table.cards.collectionAlpha',
    collection_beta: 'games.table.cards.collectionBeta',
    collection_gamma: 'games.table.cards.collectionGamma',
    collection_delta: 'games.table.cards.collectionDelta',
    collection_epsilon: 'games.table.cards.collectionEpsilon',

    // ADVANCED / EXPANSION CARDS
    targeted_strike: 'games.table.cards.targetedStrike',
    private_strike: 'games.table.cards.privateStrike',
    recursive_strike: 'games.table.cards.recursiveStrike',
    mega_evade: 'games.table.cards.megaEvade',
    invert: 'games.table.cards.invert',
    // ===== FUTURE PACK EXPANSION CARDS =====
    see_future_5x: 'games.table.cards.seeFuture_5x',
    alter_future_3x: 'games.table.cards.alterFuture_3x',
    alter_future_5x: 'games.table.cards.alterFuture_5x',
    reveal_future_3x: 'games.table.cards.revealFuture_3x',
    share_future_3x: 'games.table.cards.shareFuture_3x',
    draw_bottom: 'games.table.cards.drawBottom',
    swap_top_bottom: 'games.table.cards.swapTopBottom',
    bury: 'games.table.cards.bury',
    // ===== THEFT PACK EXPANSION CARDS =====
    wildcard: 'games.table.cards.wildcard',
    mark: 'games.table.cards.mark',
    steal_draw: 'games.table.cards.stealDraw',
    stash: 'games.table.cards.stash',
    // ===== CHAOS PACK EXPANSION CARDS =====
    critical_implosion: 'games.table.cards.criticalImplosion',
    containment_field: 'games.table.cards.containmentField',
    fission: 'games.table.cards.fission',
    tribute: 'games.table.cards.tribute',
    blackout: 'games.table.cards.blackout',
    // ===== DEITY PACK EXPANSION CARDS =====
    omniscience: 'games.table.cards.omniscience',
    miracle: 'games.table.cards.miracle',
    smite: 'games.table.cards.smite',
    rapture: 'games.table.cards.rapture',
  };
  return keys[card] || 'games.table.cards.generic';
}

/**
 * Get the thematic name of a card based on the current variant
 */
export function getCardName(card: CriticalCard, variant: string): string {
  const variantNames = THEMATIC_CARD_NAMES[variant];
  if (variantNames && variantNames[card]) {
    return variantNames[card];
  }

  // Fallback to internal name formatting
  return card
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get emoji for a card type
 */
export function getCardEmoji(card: CriticalCard): string {
  const emojis: Record<string, string> = {
    critical_event: '💣',
    neutralizer: '🛡️',
    strike: '⚔️',
    evade: '⏭️',
    trade: '🤝',
    reorder: '🔀',
    insight: '🔮',
    cancel: '🚫',
    collection_alpha: '🌮',
    collection_beta: '🥔',
    collection_gamma: '🌈',
    collection_delta: '🍉',
    collection_epsilon: '🧔',
    // ===== ATTACK PACK EXPANSION CARDS =====
    targeted_strike: '🎯',
    private_strike: '💜',
    recursive_strike: '🧟',
    mega_evade: '🦸',
    invert: '🔄',
    // ===== FUTURE PACK EXPANSION CARDS =====
    see_future_5x: '👀',
    alter_future_3x: '🪄',
    alter_future_5x: '🌀',
    reveal_future_3x: '📢',
    share_future_3x: '🤲',
    draw_bottom: '🔽',
    swap_top_bottom: '🔃',
    bury: '⚰️',
    // ===== THEFT PACK EXPANSION CARDS =====
    wildcard: '🃏',
    mark: '🏷️',
    steal_draw: '🤏',
    stash: '🏰',
    // ===== CHAOS PACK EXPANSION CARDS =====
    critical_implosion: '🤯',
    containment_field: '📦',
    fission: '⚛️',
    tribute: '🤲',
    blackout: '🕶️',
    // ===== DEITY PACK EXPANSION CARDS =====
    omniscience: '👁️',
    miracle: '✨',
    smite: '⚡',
    rapture: '🎺',
  };
  return emojis[card] || '🎴';
}

export function getCardDescriptionKey(card: CriticalCard): TranslationKey {
  const keys: Record<string, TranslationKey> = {
    critical_event: 'games.table.cards.descriptions.criticalEvent',
    neutralizer: 'games.table.cards.descriptions.neutralizer',
    strike: 'games.table.cards.descriptions.strike',
    evade: 'games.table.cards.descriptions.evade',
    trade: 'games.table.cards.descriptions.trade',
    reorder: 'games.table.cards.descriptions.reorder',
    insight: 'games.table.cards.descriptions.insight',
    cancel: 'games.table.cards.descriptions.cancel',
    collection_alpha: 'games.table.cards.descriptions.collectionAlpha',
    collection_beta: 'games.table.cards.descriptions.collectionBeta',
    collection_gamma: 'games.table.cards.descriptions.collectionGamma',
    collection_delta: 'games.table.cards.descriptions.collectionDelta',
    collection_epsilon: 'games.table.cards.descriptions.collectionEpsilon',
    // ===== ATTACK PACK EXPANSION CARDS =====
    targeted_strike: 'games.table.cards.descriptions.targetedStrike',
    private_strike: 'games.table.cards.descriptions.privateStrike',
    recursive_strike: 'games.table.cards.descriptions.recursiveStrike',
    mega_evade: 'games.table.cards.descriptions.megaEvade',
    invert: 'games.table.cards.descriptions.invert',
    // ===== FUTURE PACK EXPANSION CARDS =====
    see_future_5x: 'games.table.cards.descriptions.seeFuture_5x',
    alter_future_3x: 'games.table.cards.descriptions.alterFuture_3x',
    alter_future_5x: 'games.table.cards.descriptions.alterFuture_5x',
    reveal_future_3x: 'games.table.cards.descriptions.revealFuture_3x',
    share_future_3x: 'games.table.cards.descriptions.shareFuture_3x',
    draw_bottom: 'games.table.cards.descriptions.drawBottom',
    swap_top_bottom: 'games.table.cards.descriptions.swapTopBottom',
    bury: 'games.table.cards.descriptions.bury',
    // ===== THEFT PACK EXPANSION CARDS =====
    wildcard: 'games.table.cards.descriptions.wildcard',
    mark: 'games.table.cards.descriptions.mark',
    steal_draw: 'games.table.cards.descriptions.stealDraw',
    stash: 'games.table.cards.descriptions.stash',
    // ===== CHAOS PACK EXPANSION CARDS =====
    critical_implosion: 'games.table.cards.descriptions.criticalImplosion',
    containment_field: 'games.table.cards.descriptions.containmentField',
    fission: 'games.table.cards.descriptions.fission',
    tribute: 'games.table.cards.descriptions.tribute',
    blackout: 'games.table.cards.descriptions.blackout',
    // ===== DEITY PACK EXPANSION CARDS =====
    omniscience: 'games.table.cards.descriptions.omniscience',
    miracle: 'games.table.cards.descriptions.miracle',
    smite: 'games.table.cards.descriptions.smite',
    rapture: 'games.table.cards.descriptions.rapture',
  };
  return keys[card] || 'games.table.cards.descriptions.collectionAlpha';
}
