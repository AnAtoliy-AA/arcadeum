'use server';

import { revalidatePath } from 'next/cache';
import {
  checkAchievements,
  claimAchievementReward,
  getAchievementsStatus,
} from './server/achievements.server';
import type { PopupAchievement } from './store/achievementsPopupStore';

export async function claimAchievement(achievementId: string): Promise<
  | {
      ok: true;
      result: {
        achievementId: string;
        xpReward: number;
        coinReward: number;
        gemReward: number;
        totalXpEarned: number;
      };
    }
  | { ok: false; code: string }
> {
  const result = await claimAchievementReward(achievementId);

  if (result.ok) {
    revalidatePath('/');
  }

  return result;
}

/**
 * Runs a post-game achievement sweep and returns the newly unlocked
 * achievements formatted for the popup queue. Never throws — the caller
 * (client) decides what to do with the results.
 */
export async function checkNewlyUnlockedAchievements(): Promise<
  PopupAchievement[]
> {
  try {
    const ids = await checkAchievements();
    if (ids.length === 0) return [];

    const status = await getAchievementsStatus();
    if (!status) return [];

    return ids
      .map((id) => status.achievements.find((a) => a.achievementId === id))
      .filter((a): a is NonNullable<typeof a> => a !== undefined)
      .map((a) => ({
        achievementId: a.achievementId,
        name: a.name,
        rarity: a.rarity,
        xpReward: a.xpReward,
      }));
  } catch {
    return [];
  }
}
