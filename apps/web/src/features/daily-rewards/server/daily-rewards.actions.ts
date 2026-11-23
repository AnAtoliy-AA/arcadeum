'use server';

import { revalidatePath } from 'next/cache';
import { serverAuthFetch } from '@/shared/lib/server-auth-fetch';
import type { DailyRewardClaimResult } from './daily-rewards.types';

export type ClaimDailyRewardResult =
  | { ok: true; result: DailyRewardClaimResult }
  | { ok: false; code: 'already_claimed' | 'unauthorized' | 'unknown' };

/**
 * Claim today's daily reward. `accessToken` is the client session token (the
 * httpOnly cookie lives 15 min and is not refreshed by server actions). On success, revalidates `/wallet` and `/` so
 * the next render reflects the new balance + streak; the existing
 * `WalletLiveBridge` socket will also push the balance update to the header
 * chip in real time.
 */
export async function claimDailyRewardAction(
  accessToken?: string,
): Promise<ClaimDailyRewardResult> {
  let res: Response;
  try {
    res = await serverAuthFetch('/daily-rewards/claim', {
      method: 'POST',
      // The backend still validates the token; this only supplies the same
      // credential the status request used when the cookie is missing.
      accessToken: typeof accessToken === 'string' ? accessToken : undefined,
    });
  } catch (err) {
    console.error('[claimDailyReward] fetch failed:', err);
    return { ok: false, code: 'unknown' };
  }

  if (res.status === 409) return { ok: false, code: 'already_claimed' };
  if (res.status === 401) return { ok: false, code: 'unauthorized' };
  if (!res.ok) {
    const body = await res.text().catch(() => '<unreadable>');
    console.error(`[claimDailyReward] backend ${res.status}:`, body);
    return { ok: false, code: 'unknown' };
  }

  let data: DailyRewardClaimResult;
  try {
    data = (await res.json()) as DailyRewardClaimResult;
  } catch {
    const raw = await res.text().catch(() => '<unreadable>');
    console.error('[claimDailyReward] JSON parse failed, raw:', raw);
    return { ok: false, code: 'unknown' };
  }

  revalidatePath('/wallet');
  revalidatePath('/rewards');
  revalidatePath('/');
  return { ok: true, result: data };
}
