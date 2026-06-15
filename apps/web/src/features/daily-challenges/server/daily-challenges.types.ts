export interface DailyChallenge {
  challengeId: string;
  type: string;
  gameId?: string;
  description: string;
  targetCount: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  rewardType: string;
  rewardAmount: number;
}

export interface DailyChallengesStatus {
  date: string;
  challenges: DailyChallenge[];
  allCompleted: boolean;
  nextResetAt: string;
}

export interface ClaimChallengeResult {
  challengeId: string;
  rewardType: string;
  rewardAmount: number;
  balanceAfter: number;
}
