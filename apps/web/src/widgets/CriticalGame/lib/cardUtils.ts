import type { CriticalCard } from '../types';
import type { TranslationKey } from '@/shared/lib/useTranslation';

/**
 * Get translation key for a card
 */
export function getCardTranslationKey(card: CriticalCard): TranslationKey {
  const keys: Record<string, TranslationKey> = {
    exploding_cat: 'games.table.cards.explodingCat',
    defuse: 'games.table.cards.defuse',
    attack: 'games.table.cards.attack',
    skip: 'games.table.cards.skip',
    favor: 'games.table.cards.favor',
    shuffle: 'games.table.cards.shuffle',
    see_the_future: 'games.table.cards.seeTheFuture',
    nope: 'games.table.cards.nope',
    tacocat: 'games.table.cards.tacocat',
    hairy_potato_cat: 'games.table.cards.hairyPotatoCat',
    rainbow_ralphing_cat: 'games.table.cards.rainbowRalphingCat',
    cattermelon: 'games.table.cards.cattermelon',
    bearded_cat: 'games.table.cards.beardedCat',
    // ===== ATTACK PACK EXPANSION CARDS =====
    targeted_attack: 'games.table.cards.targetedAttack',
    personal_attack: 'games.table.cards.personalAttack',
    attack_of_the_dead: 'games.table.cards.attackOfTheDead',
    super_skip: 'games.table.cards.superSkip',
    reverse: 'games.table.cards.reverse',
  };
  return keys[card] || 'games.table.cards.generic';
}

/**
 * Get emoji for a card type
 */
export function getCardEmoji(card: CriticalCard): string {
  const emojis: Record<string, string> = {
    exploding_cat: '💣',
    defuse: '🛡️',
    attack: '⚔️',
    skip: '⏭️',
    favor: '🤝',
    shuffle: '🔀',
    see_the_future: '🔮',
    nope: '🚫',
    tacocat: '🌮',
    hairy_potato_cat: '🥔',
    rainbow_ralphing_cat: '🌈',
    cattermelon: '🍉',
    bearded_cat: '🧔',
    // ===== ATTACK PACK EXPANSION CARDS =====
    targeted_attack: '🎯',
    personal_attack: '💜',
    attack_of_the_dead: '🧟',
    super_skip: '🦸',
    reverse: '🔄',
  };
  return emojis[card] || '🐱';
}

/**
 * Get translation key for a card description
 */
export function getCardDescriptionKey(card: CriticalCard): TranslationKey {
  const keys: Record<string, TranslationKey> = {
    exploding_cat: 'games.table.cards.descriptions.explodingCat',
    defuse: 'games.table.cards.descriptions.defuse',
    attack: 'games.table.cards.descriptions.attack',
    skip: 'games.table.cards.descriptions.skip',
    favor: 'games.table.cards.descriptions.favor',
    shuffle: 'games.table.cards.descriptions.shuffle',
    see_the_future: 'games.table.cards.descriptions.seeTheFuture',
    nope: 'games.table.cards.descriptions.nope',
    tacocat: 'games.table.cards.descriptions.tacocat',
    hairy_potato_cat: 'games.table.cards.descriptions.hairyPotatoCat',
    rainbow_ralphing_cat: 'games.table.cards.descriptions.rainbowRalphingCat',
    cattermelon: 'games.table.cards.descriptions.cattermelon',
    bearded_cat: 'games.table.cards.descriptions.beardedCat',
    // ===== ATTACK PACK EXPANSION CARDS =====
    targeted_attack: 'games.table.cards.descriptions.targetedAttack',
    personal_attack: 'games.table.cards.descriptions.personalAttack',
    attack_of_the_dead: 'games.table.cards.descriptions.attackOfTheDead',
    super_skip: 'games.table.cards.descriptions.superSkip',
    reverse: 'games.table.cards.descriptions.reverse',
  };
  return keys[card] || 'games.table.cards.descriptions.tacocat';
}
