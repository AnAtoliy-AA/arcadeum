import { apiClient } from '@/shared/lib/api-client';

export interface LevelRewardsStatusResult {
  currentLevel: number;
  claimedLevel: number;
  unclaimedLevels: number[];
  pendingCoins: number;
  pendingBadges: string[];
}

export interface ClaimLevelRewardsResult {
  currentLevel: number;
  claimedLevel: number;
  coinsAwarded: number;
  badgesAwarded: string[];
  alreadyClaimed: boolean;
}

export async function getLevelRewardsStatus(
  token?: string | null,
): Promise<LevelRewardsStatusResult> {
  return apiClient.fetch<LevelRewardsStatusResult>('/xp/level-rewards', {
    token: token ?? undefined,
  });
}

export async function claimLevelRewards(
  token?: string | null,
): Promise<ClaimLevelRewardsResult> {
  return apiClient.fetch<ClaimLevelRewardsResult>('/xp/level-rewards/claim', {
    method: 'POST',
    token: token ?? undefined,
  });
}
