export const GAME_VARIANT = {
  CYBERPUNK: 'cyberpunk',
  UNDERWATER: 'underwater',
  CRIME: 'crime',
  HORROR: 'horror',
  ADVENTURE: 'adventure',
} as const;

export const CARD_VARIANTS = [
  {
    id: GAME_VARIANT.CYBERPUNK,
    name: 'The Short Circuit',
    description: 'Cyberpunk hackers preventing system overload',
    emoji: '🤖',
    gradient: 'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)',
  },
  {
    id: GAME_VARIANT.UNDERWATER,
    name: 'Deep Sea Pressure',
    description: 'Underwater horror in a leaking submarine',
    emoji: '🦑',
    gradient: 'linear-gradient(135deg, #007CF0 0%, #00DFD8 100%)',
  },
  {
    id: GAME_VARIANT.CRIME,
    name: 'The Heist',
    description: 'Crime noir theme with police raids and getaways',
    emoji: '🕵️‍♀️',
    gradient: 'linear-gradient(135deg, #F5A623 0%, #F8E71C 100%)',
  },
  {
    id: GAME_VARIANT.HORROR,
    name: 'The Cursed Banquet',
    description: 'Social horror theme at a dark sorcerer party',
    emoji: '👻',
    gradient: 'linear-gradient(135deg, #7928CA 0%, #FF0080 100%)',
  },
  {
    id: GAME_VARIANT.ADVENTURE,
    name: 'High-Altitude Hike',
    description: 'Survival adventure escaping an avalanche',
    emoji: '🏔️',
    gradient: 'linear-gradient(135deg, #4F566B 0%, #FF4D4D 100%)',
  },
] as const;

export const RANDOM_VARIANT = {
  id: 'random',
  name: 'Random Theme',
  description: 'Surprise me with a random theme!',
  emoji: '🎲',
  gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
};

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
