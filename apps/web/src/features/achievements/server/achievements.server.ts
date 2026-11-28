import 'server-only';
import { serverAuthFetch } from '@/shared/lib/server-auth-fetch';
import type {
  AchievementsStatus,
  ClaimAchievementResult,
} from './achievements.types';

export async function getAchievementsStatus(): Promise<AchievementsStatus | null> {
  try {
    const res = await serverAuthFetch('/achievements/me');

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function checkAchievements(): Promise<string[]> {
  try {
    const res = await serverAuthFetch('/achievements/check', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    // A stale/invalid session is expected (logout, expiry) — no unlocks.
    if (res.status === 401 || !res.ok) return [];

    const data: unknown = await res.json();
    if (!Array.isArray(data)) return [];
    return data.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

export async function claimAchievementReward(
  achievementId: string,
): Promise<
  { ok: true; result: ClaimAchievementResult } | { ok: false; code: string }
> {
  try {
    const res = await serverAuthFetch('/achievements/claim', {
      method: 'POST',
      body: JSON.stringify({ achievementId }),
    });

    if (res.status === 409) return { ok: false, code: 'already_claimed' };
    if (!res.ok) return { ok: false, code: 'unknown' };

    const result = await res.json();
    return { ok: true, result };
  } catch {
    return { ok: false, code: 'unknown' };
  }
}
