import 'server-only';
import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';
import type { DailyRewardStatus } from './daily-rewards.types';

/**
 * Fetch the current user's daily-reward status from the BE. Returns null on
 * any failure (auth expired, BE unreachable, transient network error) so the
 * caller can render a safe fallback rather than cascading the error up to a
 * 5xx page — same defensive pattern as `BalanceChip`.
 */
export async function getDailyRewardStatus(): Promise<DailyRewardStatus | null> {
  const cookieJar = await cookies();
  const token = cookieJar.get('web_access_token')?.value;
  if (!token) return null;

  const url = resolveApiUrl('/daily-rewards/me');

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as DailyRewardStatus;
  } catch {
    return null;
  }
}
