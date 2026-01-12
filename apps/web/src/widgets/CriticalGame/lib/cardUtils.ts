import type { CriticalCard } from '../types';
import type { TranslationKey } from '@/shared/lib/useTranslation';

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
  };
  return keys[card] || 'games.table.cards.generic';
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
  };
  return emojis[card] || '🐱';
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
  };
  return keys[card] || 'games.table.cards.descriptions.collectionAlpha';
}
