'use client';

import { resolveApiUrl } from '@/shared/lib/api-base';
import type { EffectiveShopItem } from '../server/shop.types';

/**
 * Client-side cache for the public /shop/catalog response. Used to resolve
 * an equipped item id to its asset URL + display name without forcing
 * every consumer to re-fetch. One in-flight promise per page session;
 * subsequent callers reuse the same promise.
 */

let catalogPromise: Promise<EffectiveShopItem[]> | null = null;
let catalogResult: EffectiveShopItem[] | null = null;

async function fetchCatalog(): Promise<EffectiveShopItem[]> {
  const res = await fetch(resolveApiUrl('/shop/catalog'), {
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) return [];
  return (await res.json()) as EffectiveShopItem[];
}

export function loadCatalog(): Promise<EffectiveShopItem[]> {
  if (catalogResult) return Promise.resolve(catalogResult);
  if (catalogPromise) return catalogPromise;
  catalogPromise = fetchCatalog()
    .then((rows) => {
      catalogResult = rows;
      return rows;
    })
    .catch(() => {
      catalogPromise = null;
      return [];
    });
  return catalogPromise;
}

/** Forget the cache; primarily for tests. */
export function resetCatalogCache(): void {
  catalogPromise = null;
  catalogResult = null;
}
