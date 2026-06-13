'use server';

import { revalidatePath } from 'next/cache';
import { claimChallengeReward } from './server/daily-challenges.server';

export async function claimDailyChallenge(
  challengeId: string,
  date: string,
): Promise<
  | {
      ok: true;
      result: {
        challengeId: string;
        rewardType: string;
        rewardAmount: number;
        balanceAfter: number;
      };
    }
  | { ok: false; code: string }
> {
  const result = await claimChallengeReward(challengeId, date);

  if (result.ok) {
    revalidatePath('/');
  }

  return result;
}
