'use server';

import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';
import { getTranslations } from '@/shared/i18n/server';

export async function submitWithdrawal(params: {
  walletAddress: string;
  amount: number;
}): Promise<{
  success: boolean;
  signature: string;
  amount: number;
  fee: number;
  totalDeducted: number;
}> {
  const cookieJar = await cookies();
  const token = cookieJar.get('web_access_token')?.value;

  let wallet: { withdraw: { error: string } } | null = null;
  try {
    const messages = await getTranslations();
    wallet = messages.wallet as { withdraw: { error: string } } | null;
  } catch {
    // Fallback to defaults
  }

  if (!token) throw new Error('Not authenticated');

  const res = await fetch(resolveApiUrl('/solana/withdraw'), {
    method: 'POST',
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorMsg = wallet?.withdraw.error ?? 'Withdrawal failed';
    // Never expose raw backend error bodies to the client — they may
    // contain internal details (stack traces, DB errors, RPC URLs).
    throw new Error(errorMsg);
  }

  return res.json();
}
