export interface Achievement {
  achievementId: string;
  name: string;
  description: string;
  category: string;
  rarity: string;
  iconUrl?: string;
  unlocked: boolean;
  unlockedAt?: string;
  claimed: boolean;
  xpReward: number;
  coinReward: number;
  gemReward: number;
  progress: number;
  targetProgress: number;
}

export interface AchievementsStatus {
  achievements: Achievement[];
  totalUnlocked: number;
  totalAchievements: number;
  totalXpEarned: number;
}

export interface ClaimAchievementResult {
  achievementId: string;
  xpReward: number;
  coinReward: number;
  gemReward: number;
  totalXpEarned: number;
}
