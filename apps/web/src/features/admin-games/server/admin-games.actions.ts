'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';
import type { VisibilityTier } from '../types';

// ─── Discriminated result type ────────────────────────────────────────────────

export type AdminGamesActionResult =
  | { ok: true }
  | { ok: false; error: 'validation' | 'forbidden' | 'generic' };

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const cookieJar = await cookies();
  const token = cookieJar.get('web_access_token')?.value;
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

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function setGameTierAction(input: {
  gameId: string;
  tier: VisibilityTier;
}): Promise<AdminGamesActionResult> {
  const res = await adminFetch(
    `/admin/games/${encodeURIComponent(input.gameId)}/visibility`,
    {
      method: 'PUT',
      body: JSON.stringify({ tier: input.tier }),
    },
  );

  if (res.status === 400) return { ok: false, error: 'validation' };
  if (res.status === 403) return { ok: false, error: 'forbidden' };
  if (!res.ok) return { ok: false, error: 'generic' };

  revalidatePath('/admin/games');
  return { ok: true };
}

export async function setVariantTierAction(input: {
  gameId: string;
  variantId: string;
  tier: VisibilityTier;
}): Promise<AdminGamesActionResult> {
  const res = await adminFetch(
    `/admin/games/${encodeURIComponent(input.gameId)}/variants/${encodeURIComponent(
      input.variantId,
    )}/visibility`,
    {
      method: 'PUT',
      body: JSON.stringify({ tier: input.tier }),
    },
  );

  if (res.status === 400) return { ok: false, error: 'validation' };
  if (res.status === 403) return { ok: false, error: 'forbidden' };
  if (!res.ok) return { ok: false, error: 'generic' };

  revalidatePath('/admin/games');
  return { ok: true };
}
