export const GAME_VARIANT = {
  CYBERPUNK: 'cyberpunk',
  UNDERWATER: 'underwater',
  CRIME: 'crime',
  HORROR: 'horror',
  ADVENTURE: 'adventure',
  HIGH_ALTITUDE_HIKE: 'high-altitude-hike',
} as const;

export const CARD_VARIANTS = [
  {
    id: GAME_VARIANT.CYBERPUNK,
    name: 'games.critical_v1.variants.cyberpunk.name',
    description: 'games.critical_v1.variants.cyberpunk.description',
    emoji: '🤖',
    gradient: 'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)',
  },
  {
    id: GAME_VARIANT.UNDERWATER,
    name: 'games.critical_v1.variants.underwater.name',
    description: 'games.critical_v1.variants.underwater.description',
    emoji: '🦑',
    gradient: 'linear-gradient(135deg, #007CF0 0%, #00DFD8 100%)',
  },
  {
    id: GAME_VARIANT.CRIME,
    name: 'games.critical_v1.variants.crime.name',
    description: 'games.critical_v1.variants.crime.description',
    emoji: '🕵️‍♀️',
    gradient: 'linear-gradient(135deg, #F5A623 0%, #F8E71C 100%)',
    disabled: true,
  },
  {
    id: GAME_VARIANT.HORROR,
    name: 'games.critical_v1.variants.horror.name',
    description: 'games.critical_v1.variants.horror.description',
    emoji: '👻',
    gradient: 'linear-gradient(135deg, #7928CA 0%, #FF0080 100%)',
    disabled: true,
  },
  {
    id: GAME_VARIANT.ADVENTURE,
    name: 'games.critical_v1.variants.adventure.name',
    description: 'games.critical_v1.variants.adventure.description',
    emoji: '🏔️',
    gradient: 'linear-gradient(135deg, #4F566B 0%, #FF4D4D 100%)',
    disabled: true,
  },
  {
    id: GAME_VARIANT.HIGH_ALTITUDE_HIKE,
    name: 'games.critical_v1.variants.high-altitude-hike.name',
    description: 'games.critical_v1.variants.high-altitude-hike.description',
    emoji: '🏔️',
    gradient: 'linear-gradient(135deg, #7dd3fc 0%, #1e3a8a 100%)',
  },
] as const;

export const RANDOM_VARIANT = {
  id: 'random',
  name: 'games.critical_v1.variants.random.name',
  description: 'games.critical_v1.variants.random.description',
  emoji: '🎲',
  gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
};

export const CRITICAL_VARIANTS = [...CARD_VARIANTS, RANDOM_VARIANT] as const;

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
  | 'rapture';

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

import {
  BASE_ACTION_CARDS,
  ATTACK_PACK_CARDS,
  FUTURE_PACK_CARDS,
  THEFT_PACK_CARDS,
  DEITY_PACK_CARDS,
  CriticalCard,
} from '@/shared/types/games';

import { HandLayoutMode } from '../types';

// All playable action cards (single click to play)
// Note: 'wildcard' is excluded as it's used in combos, not played directly
export const PLAYABLE_ACTION_CARDS: CriticalCard[] = [
  ...BASE_ACTION_CARDS.filter((c) => c !== 'cancel'), // cancel handled separately via onPlayNope
  ...ATTACK_PACK_CARDS,
  ...FUTURE_PACK_CARDS,
  ...THEFT_PACK_CARDS.filter((c) => c !== 'wildcard'), // wildcard used in combos
  ...DEITY_PACK_CARDS,
];

export const HAND_LAYOUT_OPTIONS: HandLayoutMode[] = [
  'grid',
  'grid-3',
  'grid-4',
  'grid-5',
  'grid-6',
  'linear',
];
