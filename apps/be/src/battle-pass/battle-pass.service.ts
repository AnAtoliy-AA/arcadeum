import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User } from '../auth/schemas/user.schema';
import { WalletService } from '../wallet/wallet.service';
import { InventoryService } from '../shop/services/inventory.service';
import {
  BattlePassProgress,
  type BattlePassProgressDocument,
} from './schemas/battle-pass-progress.schema';
import {
  CURRENT_SEASON,
  currentTierForXp,
  isPremiumRole,
  type BattlePassReward,
  type BattlePassTier,
} from './battle-pass.constants';
import type { BattlePassStateDto, ClaimResultDto } from './dto/battle-pass.dto';

type RewardLane = 'free' | 'premium';

@Injectable()
export class BattlePassService {
  constructor(
    @InjectModel(BattlePassProgress.name)
    private readonly progressModel: Model<BattlePassProgressDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly wallet: WalletService,
    private readonly inventory: InventoryService,
  ) {}

  private async resolveXp(userId: string): Promise<number> {
    try {
      const user = await this.userModel
        .findById(userId)
        .select('xp')
        .lean<{ xp?: number } | null>();
      return user?.xp ?? 0;
    } catch {
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

  private rewardsFor(
    tierDef: BattlePassTier,
    isPremium: boolean,
  ): Array<{ lane: RewardLane; reward: BattlePassReward }> {
    const entries: Array<{ lane: RewardLane; reward: BattlePassReward }> = [
      { lane: 'free', reward: tierDef.freeReward },
    ];
    if (isPremium) {
      entries.push({ lane: 'premium', reward: tierDef.premiumReward });
    }
    return entries;
  }

  /**
   * Pay out a tier's rewards. Each grant carries a deterministic idempotency key
   * (`bp:season:tier:lane:user`) so a retry — or a concurrent double-claim —
   * never credits or grants twice. Grants run before the tier is marked claimed;
   * if one fails the tier stays unclaimed and the (idempotent) grants re-run on
   * retry. A single cross-service transaction is unnecessary given the keys.
   */
  private async grantRewards(
    userId: string,
    tier: number,
    entries: Array<{ lane: RewardLane; reward: BattlePassReward }>,
  ): Promise<void> {
    for (const { lane, reward } of entries) {
      const key = `bp:${CURRENT_SEASON.id}:${tier}:${lane}:${userId}`;
      if (reward.type === 'coins' || reward.type === 'gems') {
        if (!reward.amount) continue;
        await this.wallet.credit(
          userId,
          reward.type,
          reward.amount,
          'battle_pass_reward',
          key,
          { seasonId: CURRENT_SEASON.id, tier, lane },
        );
      } else if (reward.type === 'cosmetic' && reward.itemId) {
        await this.inventory.grant(userId, reward.itemId, key);
      }
    }
  }

  /**
   * Award XP to a player after a game. XP is persisted on the user document
   * so it survives across sessions and seasons. The formula mirrors the
   * original derivation: 10 XP per game played + 40 XP bonus for a win.
   */
  async awardGameXp(playerIds: string[], winners: string[]): Promise<void> {
    const humanIds = playerIds.filter((id) => !id.startsWith('bot-'));
    if (humanIds.length === 0) return;

    const bulkOps = humanIds.map((userId) => {
      const isWinner = winners.includes(userId);
      const xpGain = 10 + (isWinner ? 40 : 0);
      return {
        updateOne: {
          filter: { _id: userId },
          update: { $inc: { xp: xpGain } },
        },
      };
    });

    await this.userModel.bulkWrite(bulkOps);
  }

  async claim(userId: string, tier: number): Promise<ClaimResultDto> {
    const tierDef = CURRENT_SEASON.tiers.find((t) => t.tier === tier);
    if (!tierDef) {
      throw new BadRequestException('Unknown battle pass tier');
    }

    const [xp, isPremium, progress] = await Promise.all([
      this.resolveXp(userId),
      this.resolveIsPremium(userId),
      this.progressModel
        .findOne({ userId, seasonId: CURRENT_SEASON.id })
        .lean<{ claimedTiers: number[] } | null>(),
    ]);

    const entries = this.rewardsFor(tierDef, isPremium);
    const rewards = entries.map((e) => e.reward);
    const alreadyClaimed = progress?.claimedTiers ?? [];

    // Already claimed → idempotent no-op (don't pay out again).
    if (alreadyClaimed.includes(tier)) {
      return { tier, claimedTiers: alreadyClaimed, rewards };
    }

    if (xp < tierDef.xpRequired) {
      throw new BadRequestException('Tier is not unlocked yet');
    }

    // Pay out first, then record the claim so a payout failure is retryable.
    await this.grantRewards(userId, tier, entries);

    const updated = await this.progressModel
      .findOneAndUpdate(
        { userId, seasonId: CURRENT_SEASON.id },
        { $addToSet: { claimedTiers: tier } },
        { new: true, upsert: true },
      )
      .lean<{ claimedTiers: number[] } | null>();

    return { tier, claimedTiers: updated?.claimedTiers ?? [tier], rewards };
  }
}
