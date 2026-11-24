import 'server-only';
import { serverAuthFetch } from '@/shared/lib/server-auth-fetch';
import type { AdminGameRow } from '../types';

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  return serverAuthFetch(path, init);
}

// ─── Server-side data fetchers ────────────────────────────────────────────────

export async function listAdminGames(): Promise<AdminGameRow[]> {
  const res = await adminFetch('/admin/games/visibility');
  if (!res.ok) throw new Error(`listAdminGames failed: ${res.status}`);
  return (await res.json()) as AdminGameRow[];
}
