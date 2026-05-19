import type { CatalogResponse } from '@/features/games/api';

/**
 * Builds two look-up maps from a catalog response:
 * - gameComingSoon: gameId → boolean
 * - variantComingSoon: "gameId::variantId" → boolean
 *
 * Returns empty maps when catalog is null (fetch not yet complete or failed).
 */
export function buildComingSoonMaps(catalog: CatalogResponse | null): {
  gameComingSoon: Map<string, boolean>;
  variantComingSoon: Map<string, boolean>;
} {
  const gameComingSoon = new Map<string, boolean>();
  const variantComingSoon = new Map<string, boolean>();

  if (!catalog) return { gameComingSoon, variantComingSoon };

  for (const g of catalog.games) {
    gameComingSoon.set(g.gameId, g.comingSoon);
    for (const v of g.variants) {
      variantComingSoon.set(`${g.gameId}::${v.id}`, v.comingSoon);
    }
  }

  return { gameComingSoon, variantComingSoon };
}

/**
 * Returns true when the selected game or variant is flagged as coming-soon,
 * which should disable the Create Room button.
 */
export function isCreateBlocked(
  gameComingSoon: Map<string, boolean>,
  variantComingSoon: Map<string, boolean>,
  gameId: string,
  variantId: string | null | undefined,
): boolean {
  if (gameComingSoon.get(gameId)) return true;
  if (variantId && variantComingSoon.get(`${gameId}::${variantId}`))
    return true;
  return false;
}
