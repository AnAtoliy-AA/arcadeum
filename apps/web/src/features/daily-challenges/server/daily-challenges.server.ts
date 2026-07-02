import 'server-only';
import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';
import type {
  DailyChallengesStatus,
  ClaimChallengeResult,
} from './daily-challenges.types';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value ?? null;
}

export async function getDailyChallengesStatus(): Promise<DailyChallengesStatus | null> {
  try {
    const token = await getToken();
    if (!token) return null;

    const res = await fetch(resolveApiUrl('/daily-challenges/me'), {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

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
    const token = await getToken();
    if (!token) return { ok: false, code: 'unauthorized' };

    const res = await fetch(resolveApiUrl('/daily-challenges/claim'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ challengeId, date }),
      cache: 'no-store',
    });

    if (res.status === 409) return { ok: false, code: 'already_claimed' };
    if (!res.ok) return { ok: false, code: 'unknown' };

    const result = await res.json();
    return { ok: true, result };
  } catch {
    return { ok: false, code: 'unknown' };
  }
}
