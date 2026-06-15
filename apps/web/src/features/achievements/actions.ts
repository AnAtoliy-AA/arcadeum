'use server';

import { revalidatePath } from 'next/cache';
import { claimAchievementReward } from './server/achievements.server';

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
