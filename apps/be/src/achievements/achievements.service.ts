import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AchievementDefinition,
  AchievementDefinitionDocument,
} from './schemas/achievement-definition.schema';
import {
  UserAchievement,
  UserAchievementDocument,
} from './schemas/user-achievement.schema';
import { WalletService } from '../wallet/wallet.service';
import { GameHistoryStatsService } from '../games/history/game-history-stats.service';

export interface AchievementView {
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
  achievements: AchievementView[];
  totalUnlocked: number;
  totalAchievements: number;
  totalXpEarned: number;
}

export interface ClaimResult {
  achievementId: string;
  xpReward: number;
  coinReward: number;
  gemReward: number;
  totalXpEarned: number;
}

@Injectable()
export class AchievementsService {
  private readonly logger = new Logger(AchievementsService.name);

  constructor(
    @InjectModel(AchievementDefinition.name)
    private readonly definitionModel: Model<AchievementDefinitionDocument>,
    @InjectModel(UserAchievement.name)
    private readonly progressModel: Model<UserAchievementDocument>,
    private readonly wallet: WalletService,
    private readonly statsService: GameHistoryStatsService,
  ) {}

  async getStatus(userId: string): Promise<AchievementsStatus> {
    const definitions = await this.definitionModel
      .find()
      .sort({ sortOrder: 1 })
      .exec();
    const progress = await this.getOrCreateProgress(userId);
    const stats = await this.statsService.getPlayerStats(userId);

    const achievements = definitions.map((def) => {
      const userAchievement = progress.achievements.find(
        (a) => a.achievementId === def.achievementId,
      );
      const { current, target } = this.getProgress(def, userId, stats);
      return {
        achievementId: def.achievementId,
        name: def.name,
        description: def.description,
        category: def.category,
        rarity: def.rarity,
        iconUrl: def.iconUrl,
        unlocked: !!userAchievement?.unlockedAt,
        unlockedAt: userAchievement?.unlockedAt?.toISOString(),
        claimed: userAchievement?.claimed ?? false,
        xpReward: def.xpReward,
        coinReward: def.coinReward,
        gemReward: def.gemReward,
        progress: current,
        targetProgress: target,
      };
    });

    return {
      achievements,
      totalUnlocked: achievements.filter((a) => a.unlocked).length,
      totalAchievements: achievements.length,
      totalXpEarned: progress.totalXpEarned,
    };
  }

  async checkAndUnlock(userId: string): Promise<string[]> {
    if (userId.startsWith('bot-')) return [];

    const definitions = await this.definitionModel.find().exec();
    const progress = await this.getOrCreateProgress(userId);
    const stats = await this.statsService.getPlayerStats(userId);
    const newlyUnlocked: string[] = [];

    for (const def of definitions) {
      const existing = progress.achievements.find(
        (a) => a.achievementId === def.achievementId,
      );
      if (existing?.unlockedAt) continue;

      const { current, target } = this.getProgress(def, userId, stats);
      if (current >= target) {
        if (existing) {
          existing.unlockedAt = new Date();
        } else {
          progress.achievements.push({
            achievementId: def.achievementId,
            unlockedAt: new Date(),
            claimed: false,
          });
        }
        newlyUnlocked.push(def.achievementId);
      }
    }

    if (newlyUnlocked.length > 0) {
      await progress.save();
    }

    return newlyUnlocked;
  }

  async claimReward(
    userId: string,
    achievementId: string,
  ): Promise<ClaimResult> {
    const definition = await this.definitionModel.findOne({ achievementId });
    if (!definition) throw new Error('Achievement not found');

    const progress = await this.getOrCreateProgress(userId);
    const userAchievement = progress.achievements.find(
      (a) => a.achievementId === achievementId,
    );
    if (!userAchievement?.unlockedAt)
      throw new Error('Achievement not unlocked');
    if (userAchievement.claimed) throw new Error('Already claimed');

    const idempotencyKey = `ach:${achievementId}:${userId}`;

    if (definition.coinReward > 0) {
      await this.wallet.credit(
        userId,
        'coins',
        definition.coinReward,
        'achievement',
        `${idempotencyKey}:coins`,
      );
    }

    if (definition.gemReward > 0) {
      await this.wallet.credit(
        userId,
        'gems',
        definition.gemReward,
        'achievement',
        `${idempotencyKey}:gems`,
      );
    }

    userAchievement.claimed = true;
    progress.totalXpEarned += definition.xpReward;
    await progress.save();

    return {
      achievementId,
      xpReward: definition.xpReward,
      coinReward: definition.coinReward,
      gemReward: definition.gemReward,
      totalXpEarned: progress.totalXpEarned,
    };
  }

  private async getOrCreateProgress(
    userId: string,
  ): Promise<UserAchievementDocument> {
    let progress = await this.progressModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!progress) {
      progress = await this.progressModel.create({
        userId: new Types.ObjectId(userId),
        achievements: [],
        totalXpEarned: 0,
      });
    }

    return progress;
  }

  private getProgress(
    def: AchievementDefinitionDocument,
    userId: string,
    stats: { totalGames: number; wins: number; winRate: number },
  ): { current: number; target: number } {
    const target = 1;

    switch (def.achievementId) {
      case 'first_win':
        return { current: stats.wins > 0 ? 1 : 0, target };
      case 'win_10':
        return { current: Math.min(stats.wins, 10), target: 10 };
      case 'win_50':
        return { current: Math.min(stats.wins, 50), target: 50 };
      case 'win_100':
        return { current: Math.min(stats.wins, 100), target: 100 };
      case 'play_10':
        return { current: Math.min(stats.totalGames, 10), target: 10 };
      case 'play_50':
        return { current: Math.min(stats.totalGames, 50), target: 50 };
      case 'play_100':
        return { current: Math.min(stats.totalGames, 100), target: 100 };
      case 'play_500':
        return { current: Math.min(stats.totalGames, 500), target: 500 };
      case 'play_1000':
        return { current: Math.min(stats.totalGames, 1000), target: 1000 };
      case 'sea_battle_veteran':
        return { current: Math.min(stats.totalGames, 25), target: 25 };
      case 'sea_battle_master':
        return { current: Math.min(stats.wins, 100), target: 100 };
      case 'critical_veteran':
        return { current: Math.min(stats.totalGames, 25), target: 25 };
      case 'critical_master':
        return { current: Math.min(stats.wins, 100), target: 100 };
      default:
        return { current: 0, target };
    }
  }
}
