'use server';

import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';

export type BulkRewardType = 'coins' | 'gems' | 'arcadeum' | 'item';

export interface BulkRewardResult {
  totalUsers: number;
  successfulRewards: number;
  failedRewards: number;
  errors: string[];
}

export type AdminBulkRewardsActionError =
  | 'validation'
  | 'forbidden'
  | 'generic';

export type AdminBulkRewardsActionResult =
  | { ok: true; data: BulkRewardResult }
  | { ok: false; error: AdminBulkRewardsActionError };

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

function classify(status: number): AdminBulkRewardsActionError {
  if (status === 400) return 'validation';
  if (status === 403) return 'forbidden';
  return 'generic';
}

export async function sendBulkRewardsAction(input: {
  type: BulkRewardType;
  amount: number;
  itemId?: string;
  reason?: string;
}): Promise<AdminBulkRewardsActionResult> {
  if (!input.type || (input.type === 'item' && !input.itemId?.trim())) {
    return { ok: false, error: 'validation' };
  }

  if (!input.amount || input.amount < 1 || input.amount > 1_000_000) {
    return { ok: false, error: 'validation' };
  }

  const res = await adminFetch('/admin/bulk-rewards', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!res.ok) return { ok: false, error: classify(res.status) };

  return { ok: true, data: (await res.json()) as BulkRewardResult };
}
