import type { CardKey as CardArtworkKey } from '@/components/cards';
import type { CriticalCard, CriticalCatCard } from './types';

export const TABLE_DIAMETER = 230;
export const PLAYER_SEAT_SIZE = 88;

export const CAT_COMBO_CARDS: CriticalCatCard[] = [
  'collection_alpha',
  'collection_beta',
  'collection_gamma',
  'collection_delta',
  'collection_epsilon',
];

export const DESIRED_CARD_OPTIONS: CriticalCard[] = [
  'critical_event',
  'neutralizer',
  'strike',
  'evade',
  'trade',
  'reorder',
  'insight',
  'cancel',
  ...CAT_COMBO_CARDS,
];

export const QUICK_ACTION_CARDS = [
  'evade',
  'strike',
  'reorder',
  'insight',
  'targeted_strike',
  'private_strike',
  'recursive_strike',
  'mega_evade',
  'invert',
] as const;

type CardArtworkVariant = 1 | 2 | 3;

export const CARD_ART_SETTINGS: Record<
  CriticalCard,
  { key: CardArtworkKey; variant: CardArtworkVariant }
> = {
  critical_event: { key: 'critical_event', variant: 1 },
  neutralizer: { key: 'neutralizer', variant: 1 },
  strike: { key: 'strike', variant: 1 },
  evade: { key: 'evade', variant: 1 },
  trade: { key: 'trade', variant: 1 },
  reorder: { key: 'reorder', variant: 1 },
  insight: { key: 'insight', variant: 1 },
  cancel: { key: 'cancel', variant: 1 },
  collection_alpha: { key: 'collection_alpha', variant: 1 },
  collection_beta: { key: 'collection_beta', variant: 1 },
  collection_gamma: { key: 'collection_gamma', variant: 1 },
  collection_delta: { key: 'collection_delta', variant: 1 },
  collection_epsilon: { key: 'collection_epsilon', variant: 1 },
  targeted_strike: { key: 'targeted_strike', variant: 1 },
  private_strike: { key: 'private_strike', variant: 1 },
  recursive_strike: { key: 'recursive_strike', variant: 1 },
  mega_evade: { key: 'mega_evade', variant: 1 },
  invert: { key: 'invert', variant: 1 },
  // Future Pack
  see_future_5x: { key: 'see_future_5x', variant: 1 },
  alter_future_3x: { key: 'alter_future_3x', variant: 1 },
  alter_future_5x: { key: 'alter_future_5x', variant: 1 },
  reveal_future_3x: { key: 'reveal_future_3x', variant: 1 },
  share_future_3x: { key: 'share_future_3x', variant: 1 },
  draw_bottom: { key: 'draw_bottom', variant: 1 },
  swap_top_bottom: { key: 'swap_top_bottom', variant: 1 },
  bury: { key: 'bury', variant: 1 },
  // Theft Pack
  wildcard: { key: 'wildcard', variant: 1 },
  mark: { key: 'mark', variant: 1 },
  steal_draw: { key: 'steal_draw', variant: 1 },
  stash: { key: 'stash', variant: 1 },
  // Deity Pack
  omniscience: { key: 'omniscience', variant: 1 },
  miracle: { key: 'miracle', variant: 1 },
  smite: { key: 'smite', variant: 1 },
  rapture: { key: 'rapture', variant: 1 },
  // Chaos Pack
  critical_implosion: { key: 'critical_implosion', variant: 1 },
  containment_field: { key: 'containment_field', variant: 1 },
  fission: { key: 'fission', variant: 1 },
  tribute: { key: 'tribute', variant: 1 },
  blackout: { key: 'blackout', variant: 1 },
};

export const CARD_GRADIENT_COORDS = {
  start: { x: 0.08, y: 0 },
  end: { x: 0.92, y: 1 },
} as const;

export const CARD_ASPECT_RATIO = 228 / 148;
export const GRID_CARD_MIN_WIDTH = 80;
export const DEFAULT_GRID_COLUMNS = 3;
export const MIN_GRID_COLUMNS = 1;
export const MAX_GRID_COLUMNS = 6;
