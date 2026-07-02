'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';
import type { AdminTournamentItem } from '../api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MarkCompleteActionResult =
  | { ok: true; data: AdminTournamentItem }
  | {
      ok: false;
      error: 'validation' | 'not_registered' | 'not_live' | 'generic';
    };

export interface MarkCompleteInput {
  tournamentId: string;
  winnerUserId: string;
}

// ─── Internal fetch helper ─────────────────────────────────────────────────────

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

// ─── Action ───────────────────────────────────────────────────────────────────

export async function markCompleteAction(
  input: unknown,
): Promise<MarkCompleteActionResult> {
  if (typeof input !== 'object' || input === null) {
    return { ok: false, error: 'validation' };
  }

  const obj = input as Record<string, unknown>;

  if (typeof obj.tournamentId !== 'string' || obj.tournamentId.trim() === '') {
    return { ok: false, error: 'validation' };
  }

  if (typeof obj.winnerUserId !== 'string' || obj.winnerUserId.trim() === '') {
    return { ok: false, error: 'validation' };
  }

  const tournamentId = obj.tournamentId as string;
  const winnerUserId = obj.winnerUserId as string;

  const res = await adminFetch(
    `/admin/tournaments/${encodeURIComponent(tournamentId)}/complete`,
    {
      method: 'POST',
      body: JSON.stringify({ winnerUserId }),
    },
  );

  if (res.status === 400) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { message?: string }).message ?? '';
    if (
      message.includes('not_registered') ||
      message === 'tournament.winnerNotRegistered'
    ) {
      return { ok: false, error: 'not_registered' };
    }
    if (message.includes('not_live') || message === 'tournament.notLive') {
      return { ok: false, error: 'not_live' };
    }
    return { ok: false, error: 'generic' };
  }

  if (res.status === 422) return { ok: false, error: 'not_registered' };
  if (!res.ok) return { ok: false, error: 'generic' };

  revalidatePath('/admin/tournaments');
  return { ok: true, data: (await res.json()) as AdminTournamentItem };
}
