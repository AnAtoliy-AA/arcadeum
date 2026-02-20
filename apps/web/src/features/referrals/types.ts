export interface ReferralRewardItem {
  rewardId: string;
  rewardType: 'badge' | 'early_access';
  label: string;
}

export interface ReferralTier {
  tier: number;
  requiredInvites: number;
  rewards: ReferralRewardItem[];
  unlocked: boolean;
}

export interface UnlockedReward {
  rewardId: string;
  rewardType: 'badge' | 'early_access';
  unlockedAt: string;
  tier: number;
}

export interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  rewards: UnlockedReward[];
  tiers: ReferralTier[];
  nextTier: {
    requiredInvites: number;
    remaining: number;
  } | null;
}
