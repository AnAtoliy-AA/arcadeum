import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ChessSubscriptionUser,
  type ChessSubscriptionUserDocument,
  type SubscriptionTier,
} from './chess-subscription-user.schema';
import { OCI_CONNECTION } from '../../../common/providers/mongo-connections.provider';

export type { SubscriptionTier };

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
    dailyGameReviews: -1,
    dailyPuzzles: -1,
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

  constructor(
    @InjectModel(ChessSubscriptionUser.name, OCI_CONNECTION)
    private readonly model: Model<ChessSubscriptionUserDocument>,
  ) {}

  getTierLimits(tier: SubscriptionTier): SubscriptionLimits {
    return TIER_LIMITS[tier];
  }

  async getUserTier(userId: string): Promise<SubscriptionTier> {
    const doc = await this.model.findOne({ userId }).lean();
    if (!doc) return 'free';
    if (doc.tier === 'free') return 'free';
    if (doc.expiresAt && new Date(doc.expiresAt) < new Date()) {
      return 'free';
    }
    return doc.tier;
  }

  async getDailyUsage(
    userId: string,
  ): Promise<{ date: string; gameReviews: number; puzzles: number }> {
    const today = new Date().toISOString().slice(0, 10);
    const doc = await this.model.findOne({ userId }).lean();
    if (!doc || !doc.dailyUsage || doc.dailyUsage.date !== today) {
      return { date: today, gameReviews: 0, puzzles: 0 };
    }
    return doc.dailyUsage;
  }

  async recordUsage(
    userId: string,
    action: 'gameReview' | 'puzzle',
  ): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    const field =
      action === 'gameReview' ? 'dailyUsage.gameReviews' : 'dailyUsage.puzzles';
    await this.model.findOneAndUpdate(
      { userId },
      {
        $set: { 'dailyUsage.date': today },
        $inc: { [field]: 1 },
      },
      { upsert: true },
    );
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
