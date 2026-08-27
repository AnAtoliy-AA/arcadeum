/**
 * Lightweight manifest of offline-capable games (ARC-900).
 *
 * Kept dependency-free so server components can import it without pulling
 * engine code into RSC bundles. `features/offline/lib/offline-registry.ts`
 * is the source of truth; keep both in sync (checked by unit test).
 */
export const OFFLINE_GAME_SLUGS: ReadonlyArray<{
  engineId: string;
  slug: string;
}> = [
  { engineId: 'tic_tac_toe_v1', slug: 'tic-tac-toe' },
  { engineId: 'chess_v1', slug: 'chess' },
  { engineId: 'checkers_v1', slug: 'checkers' },
  { engineId: 'backgammon_v1', slug: 'backgammon' },
  { engineId: 'pachisi_v1', slug: 'pachisi' },
  { engineId: 'go_v1', slug: 'go' },
  { engineId: 'cascade_v1', slug: 'cascade' },
  { engineId: 'hearts_v1', slug: 'hearts' },
  { engineId: 'spades_v1', slug: 'spades' },
  { engineId: 'sea_battle_v1', slug: 'sea-battle' },
  { engineId: 'critical_v1', slug: 'critical' },
  { engineId: 'cat_dash_v1', slug: 'cat-dash' },
];

export function offlineSlugForEngine(engineId: string): string | null {
  return (
    OFFLINE_GAME_SLUGS.find((g) => g.engineId === engineId)?.slug ?? null
  );
}
