import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { PlayerStats } from '../games/schemas/player-stats.schema';
import { levelFromXp } from './lib/xp-level';
import { grantLevelBadges } from './lib/level-rewards';
import {
  UserInventoryItem,
  type UserInventoryItemDocument,
} from '../shop/schemas/user-inventory-item.schema';

const XP_PER_WIN = 100;
const XP_PER_LOSS = 40;
const XP_PER_DRAW = 60;

interface AggregatedStats {
  _id: string;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
}

export interface BackfillResult {
  userId: string;
  calculatedXp: number;
  previousXp: number;
  updated: boolean;
  level: number;
}

@Injectable()
export class BackfillXpService {
  private readonly logger = new Logger(BackfillXpService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(PlayerStats.name)
    private readonly playerStatsModel: Model<PlayerStats>,
    @InjectModel(UserInventoryItem.name)
    private readonly inventoryModel: Model<UserInventoryItemDocument>,
  ) {}

  async backfill(dryRun = false): Promise<{
    affected: number;
    skipped: number;
    details: BackfillResult[];
  }> {
    const stats = await this.playerStatsModel
      .aggregate<AggregatedStats>([
        {
          $group: {
            _id: '$userId',
            totalWins: { $sum: '$wins' },
            totalLosses: { $sum: '$losses' },
            totalDraws: { $sum: '$draws' },
          },
        },
      ])
      .exec();

    this.logger.log(
      `Found ${stats.length} users with game stats${dryRun ? ' (dry run)' : ''}`,
    );

    const results: BackfillResult[] = [];
    let affected = 0;
    let skipped = 0;

    for (const s of stats) {
      const userId = s._id;
      const calculatedXp =
        s.totalWins * XP_PER_WIN +
        s.totalLosses * XP_PER_LOSS +
        s.totalDraws * XP_PER_DRAW;

      if (calculatedXp === 0) {
        skipped++;
        continue;
      }

      const user = await this.userModel
        .findById(userId)
        .select('xp')
        .lean<{ xp?: number } | null>();

      const previousXp = user?.xp ?? 0;

      if (previousXp >= calculatedXp) {
        skipped++;
        results.push({
          userId,
          calculatedXp,
          previousXp,
          updated: false,
          level: levelFromXp(previousXp),
        });
        continue;
      }

      if (!dryRun) {
        await this.userModel.findOneAndUpdate(
          { _id: userId },
          { $set: { xp: calculatedXp } },
        );

        const level = levelFromXp(calculatedXp);
        await grantLevelBadges(userId, level, this.inventoryModel);
      }

      affected++;
      results.push({
        userId,
        calculatedXp,
        previousXp,
        updated: true,
        level: levelFromXp(calculatedXp),
      });
    }

    this.logger.log(
      `Backfill complete: ${affected} updated, ${skipped} skipped`,
    );

    return { affected, skipped, details: results };
  }
}
