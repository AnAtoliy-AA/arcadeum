export interface CacheEntry {
  url: string;
  cachedAt: number;
}

export interface OfflineCacheStats {
  cachedGames: string[];
  totalCachedAssets: number;
  isOnline: boolean;
}

const CACHE_NAME_PREFIX = 'arcadeum-game-cache-';

export async function cacheGameAssets(
  gameId: string,
  assetUrls: string[],
): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return false;
  }

  try {
    const cache = await window.caches.open(`${CACHE_NAME_PREFIX}${gameId}`);
    await cache.addAll(assetUrls);
    return true;
  } catch {
    return false;
  }
}

export async function isGameCached(gameId: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return false;
  }

  try {
    return await window.caches.has(`${CACHE_NAME_PREFIX}${gameId}`);
  } catch {
    return false;
  }
}

export async function clearGameCache(gameId: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return false;
  }

  try {
    return await window.caches.delete(`${CACHE_NAME_PREFIX}${gameId}`);
  } catch {
    return false;
  }
}

export function getNetworkStatus(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine !== false;
}
