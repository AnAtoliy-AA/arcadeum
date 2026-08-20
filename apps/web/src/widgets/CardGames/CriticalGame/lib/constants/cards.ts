import {
  BASE_ACTION_CARDS,
  ATTACK_PACK_CARDS,
  FUTURE_PACK_CARDS,
  THEFT_PACK_CARDS,
  CHAOS_PACK_CARDS,
  DEITY_PACK_CARDS,
  CriticalCard,
} from '@/shared/types/games';

export type CardTypeKey =
  | 'critical_event'
  | 'neutralizer'
  | 'strike'
  | 'evade'
  | 'trade'
  | 'reorder'
  | 'insight'
  | 'cancel'
  | 'collection_alpha'
  | 'collection_beta'
  | 'collection_gamma'
  | 'collection_delta'
  | 'collection_epsilon'
  | 'targeted_strike'
  | 'private_strike'
  | 'recursive_strike'
  | 'mega_evade'
  | 'invert'
  | 'see_future_5x'
  | 'alter_future_3x'
  | 'alter_future_5x'
  | 'reveal_future_3x'
  | 'share_future_3x'
  | 'draw_bottom'
  | 'swap_top_bottom'
  | 'bury'
  | 'wildcard'
  | 'mark'
  | 'steal_draw'
  | 'stash'
  | 'critical_implosion'
  | 'containment_field'
  | 'fission'
  | 'tribute'
  | 'blackout'
  | 'omniscience'
  | 'miracle'
  | 'smite'
  | 'rapture'
  | 'vortex'
  | 'essence'
  | 'zen'
  | 'fury'
  | 'aegis'
  | 'blight'
  | 'bloom'
  | 'pulse'
  | 'gateway';

export const CARD_GROUPS = [
  {
    id: 'core',
    title: 'Core Cards',
    cards: [
      'critical_event',
      'neutralizer',
      'strike',
      'evade',
      'trade',
      'reorder',
      'insight',
      'cancel',
    ] as CardTypeKey[],
  },
  {
    id: 'attack',
    title: 'Attack Pack',
    cards: [
      'targeted_strike',
      'private_strike',
      'recursive_strike',
      'mega_evade',
      'invert',
    ] as CardTypeKey[],
  },
  {
    id: 'future',
    title: 'Future Pack',
    cards: [
      'see_future_5x',
      'alter_future_3x',
      'alter_future_5x',
      'reveal_future_3x',
      'share_future_3x',
      'draw_bottom',
      'swap_top_bottom',
      'bury',
    ] as CardTypeKey[],
  },
  {
    id: 'theft',
    title: 'Theft Pack',
    cards: ['wildcard', 'mark', 'steal_draw', 'stash'] as CardTypeKey[],
  },
  {
    id: 'chaos',
    title: 'Chaos Pack',
    cards: [
      'critical_implosion',
      'containment_field',
      'fission',
      'tribute',
      'blackout',
    ] as CardTypeKey[],
  },
  {
    id: 'deity',
    title: 'Deity Pack',
    cards: ['omniscience', 'miracle', 'smite', 'rapture'] as CardTypeKey[],
  },
  {
    id: 'collection',
    title: 'Collection Cards',
    cards: [
      'collection_alpha',
      'collection_beta',
      'collection_gamma',
      'collection_delta',
      'collection_epsilon',
    ] as CardTypeKey[],
  },
];

// All playable action cards (single click to play)
// Note: 'wildcard' is excluded as it's used in combos, not played directly
export const PLAYABLE_ACTION_CARDS: CriticalCard[] = [
  ...BASE_ACTION_CARDS.filter((c) => c !== 'cancel'), // cancel handled separately via onPlayNope
  ...ATTACK_PACK_CARDS,
  ...FUTURE_PACK_CARDS,
  ...THEFT_PACK_CARDS.filter((c) => c !== 'wildcard'), // wildcard used in combos
  ...CHAOS_PACK_CARDS,
  ...DEITY_PACK_CARDS,
];

/**
 * Mapping of card types to their position in a 7x7 sprite sheet (0-48)
 */
export const CARD_SPRITE_MAP: Record<string, number> = {
  // SPECIAL
  critical_event: 1,
  neutralizer: 2,

  // CORE
  strike: 3,
  evade: 4,
  trade: 5,
  reorder: 6,
  insight: 7,
  cancel: 8,

  // COLLECTION (Combo Cards)
  collection_alpha: 9,
  collection_beta: 10,
  collection_gamma: 11,
  collection_delta: 12,
  collection_epsilon: 13,

  // ATTACK PACK
  targeted_strike: 14,
  private_strike: 15,
  recursive_strike: 16,
  mega_evade: 17,
  invert: 18,

  // FUTURE PACK
  see_future_5x: 19,
  alter_future_3x: 20,
  alter_future_5x: 21,
  reveal_future_3x: 22,
  share_future_3x: 23,
  draw_bottom: 24,
  swap_top_bottom: 25,
  bury: 26,

  // THEFT PACK
  wildcard: 27,
  mark: 28,
  steal_draw: 29,
  stash: 30,

  // DEITY PACK
  omniscience: 31,
  miracle: 32,
  smite: 33,
  rapture: 34,

  // CHAOS PACK (Planned/Extra)
  critical_implosion: 35,
  containment_field: 36,
  fission: 37,
  tribute: 38,
  blackout: 39,

  // VOID PACK (Extra/Wildcard)
  vortex: 40,
  essence: 41,
  zen: 42,
  fury: 43,
  aegis: 44,
  blight: 45,
  bloom: 46,
  pulse: 47,
  gateway: 48,
};
