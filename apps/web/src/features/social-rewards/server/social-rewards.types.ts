export type SocialPlatformId =
  | 'discord'
  | 'telegram'
  | 'x'
  | 'github'
  | 'youtube'
  | 'instagram'
  | 'tiktok'
  | 'threads'
  | 'facebook'
  | 'linkedin'
  | (string & {});

export interface SocialRewardStatusItem {
  platform: SocialPlatformId;
  gems: number;
  claimed: boolean;
  claimedAt: string | null;
}

export interface SocialRewardsStatus {
  items: SocialRewardStatusItem[];
  totalClaimed: number;
  totalAvailable: number;
  gemsPerSubscription: number;
}

export interface ClaimSocialRewardResponse {
  success: boolean;
  platform: SocialPlatformId;
  gemsAwarded: number;
  gemsBalanceAfter: number;
  claimedAt: string;
}

export type ClaimSocialRewardResult =
  | { ok: true; result: ClaimSocialRewardResponse }
  | {
      ok: false;
      code: 'already_claimed' | 'unauthorized' | 'invalid_platform' | 'unknown';
    };
