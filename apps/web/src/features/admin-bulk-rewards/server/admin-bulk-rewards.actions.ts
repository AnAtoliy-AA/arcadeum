'use server';

import { serverAuthFetch } from '@/shared/lib/server-auth-fetch';

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

  const res = await serverAuthFetch('/admin/bulk-rewards', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!res.ok) return { ok: false, error: classify(res.status) };

  return { ok: true, data: (await res.json()) as BulkRewardResult };
}
