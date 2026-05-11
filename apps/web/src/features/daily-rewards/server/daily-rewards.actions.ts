'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';
import type { DailyRewardClaimResult } from './daily-rewards.types';

export type ClaimDailyRewardResult =
  | { ok: true; result: DailyRewardClaimResult }
  | { ok: false; code: 'already_claimed' | 'unauthorized' | 'unknown' };

/**
 * Claim today's daily reward. On success, revalidates `/wallet` and `/` so
 * the next render reflects the new balance + streak; the existing
 * `WalletLiveBridge` socket will also push the balance update to the header
 * chip in real time.
 */
export async function claimDailyRewardAction(): Promise<ClaimDailyRewardResult> {
  const cookieJar = await cookies();
  const token = cookieJar.get('web_access_token')?.value;
  const url = resolveApiUrl('/daily-rewards/claim');

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    // Network failure, BE unreachable, etc.
    return { ok: false, code: 'unknown' };
  }

  if (res.status === 409) return { ok: false, code: 'already_claimed' };
  if (res.status === 401) return { ok: false, code: 'unauthorized' };
  if (!res.ok) return { ok: false, code: 'unknown' };

  let data: DailyRewardClaimResult;
  try {
    data = (await res.json()) as DailyRewardClaimResult;
  } catch {
    return { ok: false, code: 'unknown' };
  }

  revalidatePath('/wallet');
  revalidatePath('/');
  return { ok: true, result: data };
}
