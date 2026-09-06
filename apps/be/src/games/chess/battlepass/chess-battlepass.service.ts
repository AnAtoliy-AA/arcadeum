import { Injectable, Logger } from '@nestjs/common';

export interface BattlePassSeason {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  currentLevel: number;
  maxLevel: number;
}

export interface BattlePassReward {
  level: number;
  tier: 'free' | 'premium';
  type: 'coins' | 'cosmetic' | 'emote' | 'title';
  itemId: string;
  amount: number;
}

@Injectable()
export class ChessBattlePassService {
  private readonly logger = new Logger(ChessBattlePassService.name);

  getCurrentSeason(): BattlePassSeason {
    return {
      id: 'season-1',
      name: 'Season 1',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      currentLevel: 1,
      maxLevel: 50,
    };
  }

  getUserProgress(_userId: string): {
    level: number;
    xp: number;
    xpToNext: number;
  } {
    return { level: 1, xp: 0, xpToNext: 100 };
  }

  addXp(_userId: string, amount: number): void {
    this.logger.log(`Adding ${amount} XP to user`);
  }

  getRewardsForLevel(level: number): BattlePassReward[] {
    const rewards: BattlePassReward[] = [];
    if (level % 5 === 0) {
      rewards.push({
        level,
        tier: 'free',
        type: 'coins',
        itemId: 'coins',
        amount: 100,
      });
    }
    if (level % 10 === 0) {
      rewards.push({
        level,
        tier: 'premium',
        type: 'cosmetic',
        itemId: `board-theme-${level}`,
        amount: 1,
      });
    }
    return rewards;
  }
}
