import type { CardKey as CardArtworkKey } from '@/components/cards';
import type { ExplodingCatsCard, ExplodingCatsCatCard } from './types';

export const TABLE_DIAMETER = 230;
export const PLAYER_SEAT_SIZE = 88;

export const CAT_COMBO_CARDS: ExplodingCatsCatCard[] = [
  'tacocat',
  'hairy_potato_cat',
  'rainbow_ralphing_cat',
  'cattermelon',
  'bearded_cat',
];

export const DESIRED_CARD_OPTIONS: ExplodingCatsCard[] = [
  'exploding_cat',
  'defuse',
  'attack',
  'skip',
  'favor',
  'shuffle',
  'see_the_future',
  'nope',
  ...CAT_COMBO_CARDS,
];

type CardArtworkVariant = 1 | 2 | 3;

export const CARD_ART_SETTINGS: Record<
  ExplodingCatsCard,
  { key: CardArtworkKey; variant: CardArtworkVariant }
> = {
  exploding_cat: { key: 'exploding-cat', variant: 1 },
  defuse: { key: 'defuse', variant: 2 },
  attack: { key: 'attack', variant: 1 },
  skip: { key: 'skip', variant: 2 },
  favor: { key: 'skip', variant: 1 }, // TODO: Add proper SVG artwork
  shuffle: { key: 'skip', variant: 3 }, // TODO: Add proper SVG artwork
  see_the_future: { key: 'defuse', variant: 1 }, // TODO: Add proper SVG artwork
  nope: { key: 'defuse', variant: 3 }, // TODO: Add proper SVG artwork
  tacocat: { key: 'tacocat', variant: 1 },
  hairy_potato_cat: { key: 'hairy-potato-cat', variant: 2 },
  rainbow_ralphing_cat: { key: 'rainbow-ralphing-cat', variant: 2 },
  cattermelon: { key: 'cattermelon', variant: 1 },
  bearded_cat: { key: 'bearded-cat', variant: 3 },
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
