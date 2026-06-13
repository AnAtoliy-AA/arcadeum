export interface GameCatalogEntry {
  gameId: string;
  variants: ReadonlyArray<string>;
}

export const GAME_CATALOG: ReadonlyArray<GameCatalogEntry> = [
  {
    gameId: 'critical_v1',
    variants: [
      'cyberpunk',
      'underwater',
      'crime',
      'horror',
      'adventure',
      'high-altitude-hike',
      'galaxy',
      'fantasy',
      'western',
      'egypt',
      'steampunk',
      'zen',
      'random',
    ],
  },
  {
    gameId: 'sea_battle_v1',
    variants: [
      'classic',
      'modern',
      'pixel',
      'cartoon',
      'cyber',
      'vintage',
      'nebula',
      'forest',
      'sunset',
      'monochrome',
    ],
  },
  { gameId: 'texas_holdem_v1', variants: [] },
  {
    gameId: 'glimworm_v1',
    variants: ['battle_royale', 'time_attack', 'lives_heats'],
  },
  {
    gameId: 'tic_tac_toe_v1',
    variants: ['classic', 'neon', 'paper', 'pixel', 'chalkboard', 'retro'],
  },
  {
    // Cascade's `variants` list is the union of visual themes AND gameplay
    // modes — the admin/game-visibility surface needs every selectable
    // option here. The engine reads them as separate axes (`variant` vs
    // `mode` in CascadeOptions); this catalog entry is the source of truth
    // for admin filtering only.
    gameId: 'cascade_v1',
    variants: [
      'cosmic',
      'arcane',
      'cyberpunk',
      'elemental',
      'classic',
      'pure',
      'speed',
    ],
  },
];

const CATALOG_INDEX = new Map<string, GameCatalogEntry>(
  GAME_CATALOG.map((g) => [g.gameId, g]),
);

export function getCatalogEntry(gameId: string): GameCatalogEntry | undefined {
  return CATALOG_INDEX.get(gameId);
}

export function hasVariant(gameId: string, variantId: string): boolean {
  return getCatalogEntry(gameId)?.variants.includes(variantId) ?? false;
}
