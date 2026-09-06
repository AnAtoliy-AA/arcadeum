import { Injectable, Logger } from '@nestjs/common';

export type SubscriptionTier = 'free' | 'premium' | 'pro';

export interface SubscriptionLimits {
  dailyGameReviews: number;
  dailyPuzzles: number;
  allBots: boolean;
  allThemes: boolean;
  videoLessons: boolean;
  fullOpeningExplorer: boolean;
  priorityMatchmaking: boolean;
  adFree: boolean;
}

const TIER_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    dailyGameReviews: 1,
    dailyPuzzles: 5,
    allBots: false,
    allThemes: false,
    videoLessons: false,
    fullOpeningExplorer: false,
    priorityMatchmaking: false,
    adFree: false,
  },
  premium: {
    dailyGameReviews: -1,
    dailyPuzzles: -1,
    allBots: true,
    allThemes: true,
    videoLessons: false,
    fullOpeningExplorer: false,
    priorityMatchmaking: false,
    adFree: true,
  },
  pro: {
    dailyGameReviews: -1,
    dailyPuzzles: -1,
    allBots: true,
    allThemes: true,
    videoLessons: true,
    fullOpeningExplorer: true,
    priorityMatchmaking: true,
    adFree: true,
  },
};

@Injectable()
export class ChessSubscriptionService {
  private readonly logger = new Logger(ChessSubscriptionService.name);
  private readonly userUsage = new Map<string, { date: string; reviews: number; puzzles: number }>();

  getTierLimits(tier: SubscriptionTier): SubscriptionLimits {
    return TIER_LIMITS[tier];
  }

  async getUserTier(_userId: string): Promise<SubscriptionTier> {
    return 'free';
  }

  canPerformAction(
    tier: SubscriptionTier,
    action: 'gameReview' | 'puzzle',
  ): boolean {
    const limits = TIER_LIMITS[tier];
    if (action === 'gameReview') {
      return limits.dailyGameReviews === -1 || limits.dailyGameReviews > 0;
    }
    if (action === 'puzzle') {
      return limits.dailyPuzzles === -1 || limits.dailyPuzzles > 0;
    }
    return true;
  }
}
