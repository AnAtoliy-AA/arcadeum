import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { PlayerStats } from '../games/schemas/player-stats.schema';
import { levelFromXp, xpForResult } from './lib/xp-level';
import type { XpSettingsValues } from './lib/xp-level';
import { XpSettingsService } from './xp-settings.service';
import { grantLevelBadges } from './lib/level-rewards';
import {
  UserInventoryItem,
  type UserInventoryItemDocument,
} from '../shop/schemas/user-inventory-item.schema';

interface AggregatedStats {
  _id: { userId: string; gameId: string };
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
    private readonly xpSettings: XpSettingsService,
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
            _id: { userId: '$userId', gameId: '$gameId' },
            totalWins: { $sum: '$wins' },
            totalLosses: { $sum: '$losses' },
            totalDraws: { $sum: '$draws' },
          },
        },
      ])
      .exec();

    const results: BackfillResult[] = [];
    let affected = 0;
    let skipped = 0;

    // Sum per user using the admin-configured rewards of each game (PvP rate).
    const perUser = new Map<string, number>();
    const settingsByGame = new Map<string, XpSettingsValues>();
    for (const s of stats) {
      const { userId, gameId } = s._id;
      let settings = settingsByGame.get(gameId);
      if (!settings) {
        settings = await this.xpSettings.getSettings(gameId);
        settingsByGame.set(gameId, settings);
      }
      const xp =
        s.totalWins * xpForResult('won', settings, false, false) +
        s.totalLosses * xpForResult('lost', settings, false, false) +
        s.totalDraws * xpForResult('draw', settings, false, false);
      perUser.set(userId, (perUser.get(userId) ?? 0) + xp);
    }

    this.logger.log(
      `Found ${perUser.size} users with game stats${dryRun ? ' (dry run)' : ''}`,
    );

    for (const [userId, calculatedXp] of perUser) {
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
        // $inc by the delta (not $set) so XP awarded concurrently by a live
        // game between the read above and this write is preserved.
        await this.userModel.findOneAndUpdate(
          { _id: userId },
          { $inc: { xp: calculatedXp - previousXp } },
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
