export interface GameCatalogEntry {
  gameId: string;
  variants: ReadonlyArray<string>;
}

export const GAME_CATALOG: ReadonlyArray<GameCatalogEntry> = [
  { gameId: 'critical_v1', variants: [] },
  { gameId: 'sea_battle_v1', variants: [] },
  { gameId: 'texas_holdem_v1', variants: [] },
  {
    gameId: 'glimworm_v1',
    variants: ['battle_royale', 'time_attack', 'lives_heats'],
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
