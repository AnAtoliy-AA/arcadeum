'use server';

import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';

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
    const body = await res.text();
    throw new Error(`Withdrawal failed: ${res.status} ${body}`);
  }

  return res.json();
}
