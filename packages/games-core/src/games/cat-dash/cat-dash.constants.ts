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

export interface CatAbilityDef {
  id: string;
  name: string;
  description: string;
  cost: number;
}

export const CAT_ABILITIES: Record<CatId, CatAbilityDef[]> = {
  neon: [
    {
      id: 'neon_boost',
      name: 'Digital Dash',
      description: '+3 speed on next roll',
      cost: 1,
    },
    {
      id: 'neon_shield',
      name: 'Neon Shield',
      description: 'Immune to obstacles and bumps',
      cost: 1,
    },
  ],
  whiskers: [
    {
      id: 'whiskers_slingshot',
      name: 'Aero Slingshot',
      description: 'Leap 2 spaces ahead of closest rival',
      cost: 1,
    },
    {
      id: 'whiskers_reroll',
      name: 'Lucky Paws',
      description: 'Gain an extra roll this turn',
      cost: 1,
    },
  ],
  stardust: [
    {
      id: 'stardust_warp',
      name: 'Warp Jump',
      description: 'Teleport to nearest forward bonus tile',
      cost: 1,
    },
    {
      id: 'stardust_shield',
      name: 'Star Shield',
      description: 'Immune to obstacles and bumps',
      cost: 1,
    },
  ],
  felix: [
    {
      id: 'felix_precision',
      name: 'Apex Calculation',
      description: 'Sets roll to exact 4 without RNG',
      cost: 1,
    },
    {
      id: 'felix_boost',
      name: 'Wild Charge',
      description: '+3 speed on next roll',
      cost: 1,
    },
  ],
  shadow: [
    {
      id: 'shadow_snare',
      name: 'Shadow Snare',
      description: 'Drop a snare trap on current space',
      cost: 1,
    },
    {
      id: 'shadow_leap',
      name: 'Phantom Pounce',
      description: 'Leap forward 2 spaces silently',
      cost: 1,
    },
  ],
  luna: [
    {
      id: 'luna_boost',
      name: 'Lunar Surge',
      description: '+3 speed on next roll',
      cost: 1,
    },
    {
      id: 'luna_ward',
      name: 'Moon Aegis',
      description: 'Immune to obstacles and bumps',
      cost: 1,
    },
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
