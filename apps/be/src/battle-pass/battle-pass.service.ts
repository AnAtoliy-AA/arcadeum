import {
  BadRequestException,
  Injectable,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { GameHistoryStatsService } from '../games/history/game-history-stats.service';
import { User } from '../auth/schemas/user.schema';
import {
  BattlePassProgress,
  type BattlePassProgressDocument,
} from './schemas/battle-pass-progress.schema';
import {
  CURRENT_SEASON,
  currentTierForXp,
  isPremiumRole,
  xpForStats,
  type BattlePassReward,
} from './battle-pass.constants';
import type { BattlePassStateDto, ClaimResultDto } from './dto/battle-pass.dto';

@Injectable()
export class BattlePassService {
  constructor(
    @InjectModel(BattlePassProgress.name)
    private readonly progressModel: Model<BattlePassProgressDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @Inject(forwardRef(() => GameHistoryStatsService))
    private readonly stats: GameHistoryStatsService,
  ) {}

  private async resolveXp(userId: string): Promise<number> {
    try {
      const playerStats = await this.stats.getPlayerStats(userId);
      return xpForStats(playerStats.totalGames, playerStats.wins);
    } catch {
      // No history yet (new player) — start at zero XP rather than failing.
      return 0;
    }
  }

  private async resolveIsPremium(userId: string): Promise<boolean> {
    const user = await this.userModel
      .findById(userId)
      .select('role')
      .lean<{ role?: string } | null>();
    return isPremiumRole(user?.role ?? null);
  }

  async getState(userId: string): Promise<BattlePassStateDto> {
    const [xp, isPremium, progress] = await Promise.all([
      this.resolveXp(userId),
      this.resolveIsPremium(userId),
      this.progressModel
        .findOne({ userId, seasonId: CURRENT_SEASON.id })
        .lean<{ claimedTiers: number[] } | null>(),
    ]);

    return {
      season: {
        id: CURRENT_SEASON.id,
        title: CURRENT_SEASON.title,
        startsAt: CURRENT_SEASON.startsAt,
        endsAt: CURRENT_SEASON.endsAt,
        tiers: CURRENT_SEASON.tiers,
      },
      xp,
      currentTier: currentTierForXp(xp),
      claimedTiers: progress?.claimedTiers ?? [],
      isPremium,
    };
  }

  async claim(userId: string, tier: number): Promise<ClaimResultDto> {
    const tierDef = CURRENT_SEASON.tiers.find((t) => t.tier === tier);
    if (!tierDef) {
      throw new BadRequestException('Unknown battle pass tier');
    }

    const [xp, isPremium] = await Promise.all([
      this.resolveXp(userId),
      this.resolveIsPremium(userId),
    ]);

    if (xp < tierDef.xpRequired) {
      throw new BadRequestException('Tier is not unlocked yet');
    }

    // Idempotent upsert: only add the tier if it isn't already claimed.
    const updated = await this.progressModel
      .findOneAndUpdate(
        { userId, seasonId: CURRENT_SEASON.id },
        { $addToSet: { claimedTiers: tier } },
        { new: true, upsert: true },
      )
      .lean<{ claimedTiers: number[] } | null>();

    const claimedTiers = updated?.claimedTiers ?? [tier];

    // Reward grant (wallet credit / cosmetic unlock) is intentionally a
    // follow-up — claims are recorded here and surfaced to the client.
    const rewards: BattlePassReward[] = [tierDef.freeReward];
    if (isPremium) rewards.push(tierDef.premiumReward);

    return { tier, claimedTiers, rewards };
  }
}
