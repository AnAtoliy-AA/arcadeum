'use server';

import { serverAuthFetch } from '@/shared/lib/server-auth-fetch';

export interface XpBackfillResult {
  affected: number;
  skipped: number;
  details: Array<{
    userId: string;
    calculatedXp: number;
    previousXp: number;
    updated: boolean;
    level: number;
  }>;
}

export type AdminXpBackfillActionError = 'forbidden' | 'generic';

export type AdminXpBackfillActionResult =
  | { ok: true; data: XpBackfillResult }
  | { ok: false; error: AdminXpBackfillActionError };

export async function runXpBackfillAction(
  dryRun: boolean,
): Promise<AdminXpBackfillActionResult> {
  const query = dryRun ? '?dryRun=true' : '';
  const res = await serverAuthFetch(`/admin/xp-backfill${query}`, {
    method: 'POST',
  });

  if (!res.ok) {
    const error: AdminXpBackfillActionError =
      res.status === 403 ? 'forbidden' : 'generic';
    return { ok: false, error };
  }

  return { ok: true, data: (await res.json()) as XpBackfillResult };
}
