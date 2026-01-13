// ===== COLLECTION CARDS (for combos) =====
export type CriticalCollectionCard =
  | 'collection_alpha'
  | 'collection_beta'
  | 'collection_gamma'
  | 'collection_delta'
  | 'collection_epsilon';

export const COLLECTION_CARDS: CriticalCollectionCard[] = [
  'collection_alpha',
  'collection_beta',
  'collection_gamma',
  'collection_delta',
  'collection_epsilon',
];

// ===== BASE GAME CARDS =====
export type BaseActionCard =
  | 'strike'
  | 'evade'
  | 'trade'
  | 'reorder'
  | 'insight'
  | 'cancel';

export const BASE_ACTION_CARDS: BaseActionCard[] = [
  'strike',
  'evade',
  'trade',
  'reorder',
  'insight',
  'cancel',
];

export const BASE_SPECIAL_CARDS = ['critical_event', 'neutralizer'] as const;

// ===== EXPANSION PACK IDENTIFIERS =====
export type CriticalExpansion =
  | 'attack'
  | 'future'
  | 'theft'
  | 'chaos'
  | 'deity';

// ===== ATTACK PACK EXPANSION CARDS =====
export type AttackPackCard =
  | 'targeted_strike'
  | 'private_strike'
  | 'recursive_strike'
  | 'mega_evade'
  | 'invert';

export const ATTACK_PACK_CARDS: AttackPackCard[] = [
  'targeted_strike',
  'private_strike',
  'recursive_strike',
  'mega_evade',
  'invert',
];

// ===== FUTURE PACK EXPANSION CARDS =====
export type FuturePackCard =
  | 'see_future_5x'
  | 'alter_future_3x'
  | 'alter_future_5x'
  | 'reveal_future_3x'
  | 'share_future_3x'
  | 'draw_bottom'
  | 'swap_top_bottom'
  | 'bury';

export const FUTURE_PACK_CARDS: FuturePackCard[] = [
  'see_future_5x',
  'alter_future_3x',
  'alter_future_5x',
  'reveal_future_3x',
  'share_future_3x',
  'draw_bottom',
  'swap_top_bottom',
  'bury',
];

// ===== THEFT PACK EXPANSION CARDS =====
export type TheftPackCard =
  | 'wildcard' // Wildcard for combos (substitute any collection card)
  | 'mark' // Tag a card in target's hand to steal later
  | 'steal_draw' // Steal the next card a player draws
  | 'stash'; // Protected storage for cards

export const THEFT_PACK_CARDS: TheftPackCard[] = [
  'wildcard',
  'mark',
  'steal_draw',
  'stash',
];

// ===== CHAOS PACK EXPANSION CARDS =====
export type ChaosPackCard =
  | 'critical_implosion'
  | 'containment_field'
  | 'fission'
  | 'tribute'
  | 'blackout';

export const CHAOS_PACK_CARDS: ChaosPackCard[] = [
  'critical_implosion',
  'containment_field',
  'fission',
  'tribute',
  'blackout',
];

export const CARDS_REQUIRING_DRAWS: CriticalCard[] = [
  'strike',
  'evade',
  'reorder',
  'mark',
  'steal_draw',
  'stash',
  ...ATTACK_PACK_CARDS,
  ...FUTURE_PACK_CARDS,
];

export const ANYTIME_ACTION_CARDS: CriticalCard[] = ['cancel'];

// ===== COMBINED CARD TYPE =====
export type CriticalCard =
  | 'critical_event'
  | 'neutralizer'
  | BaseActionCard
  | CriticalCollectionCard
  | AttackPackCard
  | FuturePackCard
  | TheftPackCard
  | ChaosPackCard;
