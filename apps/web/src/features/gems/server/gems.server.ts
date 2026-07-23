import 'server-only';
import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';
import type { GemPackagePublic, GemPurchaseView } from './gems.types';

// ─── Shared fetch helpers ──────────────────────────────────────────────────────

async function fetchPublic<T>(path: string): Promise<T> {
  const url = resolveApiUrl(path);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gems fetch failed: ${res.status} ${body}`);
  }
  return (await res.json()) as T;
}

async function fetchWithAuth<T>(path: string): Promise<T> {
  const cookieJar = await cookies();
  const token = cookieJar.get('access_token')?.value;
  const url = resolveApiUrl(path);

  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gems auth fetch failed: ${res.status} ${body}`);
  }
  return (await res.json()) as T;
}

// ─── Public fetchers ───────────────────────────────────────────────────────────

/**
 * Fetches active gem packages sorted by displayOrder.
 * No auth required — open endpoint.
 */
export async function getActivePackages(): Promise<GemPackagePublic[]> {
  return fetchPublic<GemPackagePublic[]>('/payments/gems/packages');
}

/**
 * Fetches the current user's pending gem purchases.
 * Requires auth cookie.
 */
export async function getPendingPurchases(): Promise<GemPurchaseView[]> {
  return fetchWithAuth<GemPurchaseView[]>('/payments/gems/orders/pending');
}

/**
 * Fetches the current gem-to-coin conversion rate.
 * No auth required — global config endpoint.
 */
export async function getConversionRate(): Promise<{ rate: number }> {
  return fetchPublic<{ rate: number }>('/wallet/conversion-rate');
}
