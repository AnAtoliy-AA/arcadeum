import 'server-only';
import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';
import type {
  AchievementsStatus,
  ClaimAchievementResult,
} from './achievements.types';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value ?? null;
}

export async function getAchievementsStatus(): Promise<AchievementsStatus | null> {
  try {
    const token = await getToken();
    if (!token) return null;

    const res = await fetch(resolveApiUrl('/achievements/me'), {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function claimAchievementReward(
  achievementId: string,
): Promise<
  { ok: true; result: ClaimAchievementResult } | { ok: false; code: string }
> {
  try {
    const token = await getToken();
    if (!token) return { ok: false, code: 'unauthorized' };

    const res = await fetch(resolveApiUrl('/achievements/claim'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ achievementId }),
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
