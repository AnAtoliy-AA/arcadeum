'use server';

import { revalidatePath } from 'next/cache';
import { serverAuthFetch } from '@/shared/lib/server-auth-fetch';
import type {
  EconomyAuditView,
  EconomyKey,
  EconomySettingView,
} from './economy.types';

// ─── Discriminated result type ────────────────────────────────────────────────

export type EconomyActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: 'validation' | 'not_found' | 'forbidden' | 'generic';
    };

// ─── Internal fetch helper ────────────────────────────────────────────────────

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function setEconomyValueAction(input: {
  key: EconomyKey;
  value: number;
}): Promise<EconomyActionResult<EconomySettingView>> {
  if (!Number.isInteger(input.value) || input.value < 0) {
    return { ok: false, error: 'validation' };
  }

  const res = await serverAuthFetch(
    `/admin/economy/${encodeURIComponent(input.key)}`,
    {
      method: 'PUT',
      body: JSON.stringify({ value: input.value }),
    },
  );

  if (res.status === 400) return { ok: false, error: 'validation' };
  if (res.status === 404) return { ok: false, error: 'not_found' };
  if (res.status === 403) return { ok: false, error: 'forbidden' };
  if (!res.ok) return { ok: false, error: 'generic' };

  const data = (await res.json()) as EconomySettingView;
  revalidatePath('/admin/economy');
  return { ok: true, data };
}

export async function resetEconomyValueAction(input: {
  key: EconomyKey;
}): Promise<EconomyActionResult<{ reset: true }>> {
  const res = await serverAuthFetch(
    `/admin/economy/${encodeURIComponent(input.key)}`,
    { method: 'DELETE' },
  );

  if (res.status === 404) return { ok: false, error: 'not_found' };
  if (res.status === 403) return { ok: false, error: 'forbidden' };
  if (!res.ok) return { ok: false, error: 'generic' };

  revalidatePath('/admin/economy');
  return { ok: true, data: { reset: true } };
}

export async function refreshCacheAction(): Promise<
  EconomyActionResult<{ refreshed: true }>
> {
  const res = await serverAuthFetch('/admin/economy/refresh-cache', {
    method: 'POST',
  });

  if (res.status === 403) return { ok: false, error: 'forbidden' };
  if (!res.ok) return { ok: false, error: 'generic' };

  revalidatePath('/admin/economy');
  return { ok: true, data: { refreshed: true } };
}

export async function loadEconomyHistoryAction(input: {
  key: EconomyKey;
}): Promise<EconomyActionResult<EconomyAuditView[]>> {
  const res = await serverAuthFetch(
    `/admin/economy/${encodeURIComponent(input.key)}/audit`,
  );

  if (res.status === 404) return { ok: false, error: 'not_found' };
  if (res.status === 403) return { ok: false, error: 'forbidden' };
  if (!res.ok) return { ok: false, error: 'generic' };

  const data = (await res.json()) as EconomyAuditView[];
  return { ok: true, data };
}
