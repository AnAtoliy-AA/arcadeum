import { gamesApi, type CatalogResponse } from '@/features/games/api';
import { SSR_TIMEOUT } from '@/shared/config/app-config';
import { handleSsrFetchError } from '@/shared/lib/ssr';

/** How long a failed catalog fetch is remembered, so a build does not retry per game. */
const FAILURE_TTL_MS = 30_000;

let inFlight: Promise<CatalogResponse | null> | null = null;
let failedAt = 0;

/**
 * Fetches the catalog once for all concurrent callers. While the backend is
 * unreachable (for example during a deploy, when the web build runs before the
 * API restarts) the failure is remembered briefly and logged once, instead of
 * once per game page.
 */
function fetchCatalog(): Promise<CatalogResponse | null> {
  if (failedAt && Date.now() - failedAt < FAILURE_TTL_MS) {
    return Promise.resolve(null);
  }
  if (!inFlight) {
    inFlight = gamesApi
      .getCatalog({ timeout: SSR_TIMEOUT })
      .then((catalog) => {
        failedAt = 0;
        return catalog;
      })
      .catch((error: unknown) => {
        failedAt = Date.now();
        handleSsrFetchError('catalog', error);
        return null;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

/** Test helper: forget cached failure state. */
export function resetCatalogFetchState(): void {
  inFlight = null;
  failedAt = 0;
}

/**
 * Resolve whether a game is disabled by an admin for a server component.
 * Reads the catalog's `comingSoon` flag; defaults to `false` (playable) when
 * the catalog can't be fetched so landing pages never hard-fail.
 */
export async function isGameComingSoon(gameId: string): Promise<boolean> {
  const catalog = await fetchCatalog();
  return catalog?.games.find((g) => g.gameId === gameId)?.comingSoon ?? false;
}
