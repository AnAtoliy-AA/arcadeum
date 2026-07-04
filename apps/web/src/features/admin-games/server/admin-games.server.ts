import 'server-only';
import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';
import type { AdminGameRow } from '../types';

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const cookieJar = await cookies();
  const token = cookieJar.get('access_token')?.value;
  const url = resolveApiUrl(path);

  return fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

// ─── Server-side data fetchers ────────────────────────────────────────────────

export async function listAdminGames(): Promise<AdminGameRow[]> {
  const res = await adminFetch('/admin/games/visibility');
  if (!res.ok) throw new Error(`listAdminGames failed: ${res.status}`);
  return (await res.json()) as AdminGameRow[];
}
