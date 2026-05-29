export type BattlePassReward = {
  type: 'coins' | 'gems' | 'cosmetic';
  amount?: number;
  label: string;
};

export type BattlePassTier = {
  tier: number;
  xpRequired: number;
  freeReward: BattlePassReward;
  premiumReward: BattlePassReward;
};

export type BattlePassSeason = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  tiers: BattlePassTier[];
};

export type BattlePassState = {
  season: BattlePassSeason;
  xp: number;
  currentTier: number;
  claimedTiers: number[];
  isPremium: boolean;
};

export type ClaimResult = {
  tier: number;
  claimedTiers: number[];
  rewards: BattlePassReward[];
};
