'use server';

import { revalidatePath } from 'next/cache';
import { serverAuthFetch } from '@/shared/lib/server-auth-fetch';
import type { VisibilityTier } from '../types';

// ─── Discriminated result type ────────────────────────────────────────────────

export type AdminGamesActionResult =
  | { ok: true }
  | { ok: false; error: 'validation' | 'forbidden' | 'generic' };

// ─── Internal fetch helper ────────────────────────────────────────────────────

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function setGameTierAction(input: {
  gameId: string;
  tier: VisibilityTier;
}): Promise<AdminGamesActionResult> {
  const res = await serverAuthFetch(
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
  const res = await serverAuthFetch(
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
