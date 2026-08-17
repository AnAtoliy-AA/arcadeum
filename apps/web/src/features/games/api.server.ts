import { gamesApi } from '@/features/games/api';
import { SSR_TIMEOUT } from '@/shared/config/app-config';
import { handleSsrFetchError } from '@/shared/lib/ssr';

/**
 * Resolve whether a game is disabled by an admin for a server component.
 * Reads the catalog's `comingSoon` flag; defaults to `false` (playable) when
 * the catalog can't be fetched so landing pages never hard-fail.
 */
export async function isGameComingSoon(gameId: string): Promise<boolean> {
  try {
    const { games } = await gamesApi.getCatalog({ timeout: SSR_TIMEOUT });
    return games.find((g) => g.gameId === gameId)?.comingSoon ?? false;
  } catch (error) {
    handleSsrFetchError(`catalog for ${gameId}`, error);
    return false;
  }
}
