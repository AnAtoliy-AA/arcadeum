'use server';

import { revalidatePath } from 'next/cache';
import { serverAuthFetch } from '@/shared/lib/server-auth-fetch';
import type {
  ClaimSocialRewardResponse,
  ClaimSocialRewardResult,
} from './social-rewards.types';

export async function claimSocialRewardAction(
  platform: string,
): Promise<ClaimSocialRewardResult> {
  let res: Response;
  try {
    res = await serverAuthFetch('/social-rewards/claim', {
      method: 'POST',
      body: JSON.stringify({ platform }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch {
    return { ok: false, code: 'unknown' };
  }

  if (res.status === 409) return { ok: false, code: 'already_claimed' };
  if (res.status === 401) return { ok: false, code: 'unauthorized' };
  if (res.status === 400) return { ok: false, code: 'invalid_platform' };
  if (!res.ok) return { ok: false, code: 'unknown' };

  let data: ClaimSocialRewardResponse;
  try {
    data = (await res.json()) as ClaimSocialRewardResponse;
  } catch {
    return { ok: false, code: 'unknown' };
  }

  revalidatePath('/wallet');
  revalidatePath('/rewards');
  revalidatePath('/community');
  revalidatePath('/');

  return { ok: true, result: data };
}
