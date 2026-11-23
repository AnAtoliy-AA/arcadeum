import 'server-only';
import { serverAuthFetch } from '@/shared/lib/server-auth-fetch';
import type {
  DailyChallengesStatus,
  ClaimChallengeResult,
} from './daily-challenges.types';

export async function getDailyChallengesStatus(): Promise<DailyChallengesStatus | null> {
  try {
    const res = await serverAuthFetch('/daily-challenges/me');

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function claimChallengeReward(
  challengeId: string,
  date: string,
): Promise<
  { ok: true; result: ClaimChallengeResult } | { ok: false; code: string }
> {
  try {
    const res = await serverAuthFetch('/daily-challenges/claim', {
      method: 'POST',
      body: JSON.stringify({ challengeId, date }),
    });

    if (res.status === 409) return { ok: false, code: 'already_claimed' };
    if (!res.ok) return { ok: false, code: 'unknown' };

    const result = await res.json();
    return { ok: true, result };
  } catch {
    return { ok: false, code: 'unknown' };
  }
}
