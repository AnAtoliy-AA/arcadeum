export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;
export const TRACK_LENGTH = 59;
export const POWER_TOKENS_PER_GAME = 3;

export const TRACK_TYPES = ['linear', 'circular', 'multiple'] as const;
export type TrackType = (typeof TRACK_TYPES)[number];

export const THEMES = ['neon', 'village', 'space', 'nature'] as const;
export type Theme = (typeof THEMES)[number];

export const CAT_IDS = [
  'neon',
  'whiskers',
  'stardust',
  'felix',
  'shadow',
  'luna',
] as const;
export type CatId = (typeof CAT_IDS)[number];

export const CAT_ABILITIES: Record<
  CatId,
  { name: string; description: string }[]
> = {
  neon: [
    { name: 'Digital Dash', description: 'Skip next obstacle' },
    { name: 'Neon Shield', description: 'Block opponent ability' },
  ],
  whiskers: [
    { name: 'Extra Life', description: 'Re-roll once per game' },
    { name: 'Purr Power', description: 'Steal 1 movement' },
  ],
  stardust: [
    { name: 'Warp Jump', description: 'Teleport to bonus space' },
    { name: 'Star Shield', description: 'Immune to obstacles' },
  ],
  felix: [
    { name: "Nature's Path", description: 'Take shortest route' },
    { name: 'Wild Charge', description: 'Move double next turn' },
  ],
  shadow: [
    { name: 'Shadow Step', description: 'Move unseen' },
    { name: 'Dark Cover', description: 'Hide from opponents' },
  ],
  luna: [
    { name: 'Lunar Boost', description: 'Enhanced movement' },
    { name: 'Moon Shield', description: 'Protection ability' },
  ],
};

export const THEME_BONUSES: Record<CatId, Theme> = {
  neon: 'neon',
  whiskers: 'village',
  stardust: 'space',
  felix: 'nature',
  shadow: 'neon',
  luna: 'space',
};

export const DEFAULT_OPTIONS = {
  trackType: 'linear' as TrackType,
  theme: 'village' as Theme,
};
