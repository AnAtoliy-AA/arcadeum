import 'server-only';
import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';
import type {
  CatalogFilter,
  EffectiveShopItem,
  InventoryView,
} from './shop.types';

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const cookieJar = await cookies();
  const token = cookieJar.get('web_access_token')?.value;
  const url = resolveApiUrl(path);
  const res = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Shop fetch failed: ${res.status} ${body}`);
  }
  return (await res.json()) as T;
}

async function publicFetch<T>(path: string): Promise<T> {
  const url = resolveApiUrl(path);
  const res = await fetch(url, {
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Shop fetch failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function getCatalog(
  filter: CatalogFilter = {},
): Promise<EffectiveShopItem[]> {
  const params = new URLSearchParams();
  if (filter.category) params.set('category', filter.category);
  if (filter.rarity) params.set('rarity', filter.rarity);
  const qs = params.toString();
  return publicFetch<EffectiveShopItem[]>(`/shop/catalog${qs ? `?${qs}` : ''}`);
}

export async function getInventory(): Promise<InventoryView> {
  return authFetch<InventoryView>('/shop/inventory');
}
