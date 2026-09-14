'use server';

import { revalidatePath } from 'next/cache';
import { serverAuthFetch } from '@/shared/lib/server-auth-fetch';

export interface BuyFreezeResult {
  freezeTokens: number;
  coinsSpent: number;
}

export type BuyFreezeActionResult =
  | { ok: true; result: BuyFreezeResult }
  | {
      ok: false;
      code:
        'insufficient_funds' | 'unauthorized' | 'invalid_quantity' | 'unknown';
    };

export async function buyFreezeAction(
  quantity = 1,
): Promise<BuyFreezeActionResult> {
  let res: Response;
  try {
    res = await serverAuthFetch('/daily-rewards/buy-freeze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
  } catch {
    return { ok: false, code: 'unknown' };
  }

  if (res.status === 401) return { ok: false, code: 'unauthorized' };
  if (res.status === 400) return { ok: false, code: 'insufficient_funds' };
  if (!res.ok) return { ok: false, code: 'unknown' };

  let data: BuyFreezeResult;
  try {
    data = (await res.json()) as BuyFreezeResult;
  } catch {
    return { ok: false, code: 'unknown' };
  }

  revalidatePath('/rewards');
  revalidatePath('/wallet');
  revalidatePath('/');
  return { ok: true, result: data };
}
