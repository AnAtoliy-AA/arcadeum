import 'server-only';
import { serverAuthFetch } from '@/shared/lib/server-auth-fetch';
import type { DailyRewardStatus } from './daily-rewards.types';

/**
 * Fetch the current user's daily-reward status from the BE. Returns null on
 * any failure (auth expired, BE unreachable, transient network error) so the
 * caller can render a safe fallback rather than cascading the error up to a
 * 5xx page — same defensive pattern as `BalanceChip`.
 */
export async function getDailyRewardStatus(): Promise<DailyRewardStatus | null> {
  try {
    const res = await serverAuthFetch('/daily-rewards/me');
    if (!res.ok) return null;
    return (await res.json()) as DailyRewardStatus;
  } catch {
    return null;
  }
}
