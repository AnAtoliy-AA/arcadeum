import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { Referral } from './schemas/referral.schema';
import { ReferralReward, RewardType } from './schemas/referral-reward.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { WalletService } from '../wallet/wallet.service';
import { EconomySettingsService } from '../economy/economy-settings.service';
import type { EconomyKey } from '../economy/economy-keys';

interface RewardTierDefinition {
  tier: number;
  requiredInvites: number;
  rewards: Array<{
    rewardId: string;
    rewardType: RewardType;
    label: string;
  }>;
}

/**
 * Maximum referrals paid out per referrer per UTC day. Bounds the coin
 * minting rate from multi-account farming.
 */
const REFERRAL_DAILY_PAYOUT_CAP = 20;

const REWARD_TIERS: RewardTierDefinition[] = [
  {
    tier: 1,
    requiredInvites: 3,
    rewards: [
      {
        rewardId: 'badge_social_butterfly',
        rewardType: 'badge',
        label: 'Social Butterfly',
      },
    ],
  },
  {
    tier: 2,
    requiredInvites: 5,
    rewards: [
      {
        rewardId: 'early_access_heist',
        rewardType: 'early_access',
        label: 'Early Access: The Heist',
      },
    ],
  },
  {
    tier: 3,
    requiredInvites: 10,
    rewards: [
      {
        rewardId: 'early_access_cursed_banquet',
        rewardType: 'early_access',
        label: 'Early Access: The Cursed Banquet',
      },
      {
        rewardId: 'badge_legend_recruiter',
        rewardType: 'badge',
        label: 'Legend Recruiter',
      },
    ],
  },
];

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  private readonly tierKeys = {
    1: 'referral_tier_1_bonus_coins',
    2: 'referral_tier_2_bonus_coins',
    3: 'referral_tier_3_bonus_coins',
  } as const satisfies Record<number, EconomyKey>;

  constructor(
    @InjectModel(Referral.name)
    private readonly referralModel: Model<Referral>,
    @InjectModel(ReferralReward.name)
    private readonly rewardModel: Model<ReferralReward>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly wallet: WalletService,
    private readonly economy: EconomySettingsService,
  ) {}

  generateReferralCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const charsLen = chars.length;
    const threshold = Math.floor(256 / charsLen) * charsLen;
    const bytes = crypto.randomBytes(32);
    let code = '';
    let i = 0;
    while (code.length < 8) {
      if (bytes[i] < threshold) {
        code += chars.charAt(bytes[i] % charsLen);
      }
      i += 1;
    }
    return code;
  }

  async ensureReferralCode(userId: string): Promise<string> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.referralCode) {
      return user.referralCode;
    }

    const candidates: string[] = [];
    for (let i = 0; i < 10; i++) {
      candidates.push(this.generateReferralCode());
    }

    const existing = await this.userModel
      .find({ referralCode: { $in: candidates } })
      .select('referralCode')
      .lean<{ referralCode: string }[]>()
      .exec();
    const usedSet = new Set(existing.map((e) => e.referralCode));
    const code = candidates.find((c) => !usedSet.has(c));
    if (!code) throw new BadRequestException('Failed to generate unique code');

    user.referralCode = code;
    await user.save();
    return code;
  }

  async trackReferral(
    referralCode: string,
    referredUserId: string,
  ): Promise<string | null> {
    if (typeof referralCode !== 'string')
      throw new BadRequestException('Invalid referralCode');
    if (typeof referredUserId !== 'string')
      throw new BadRequestException('Invalid referredUserId');
    const safeCode = referralCode;
    const safeReferredUserId = referredUserId;
    const referrer = await this.userModel
      .findOne({ referralCode: safeCode })
      .lean()
      .exec();
    if (!referrer) {
      this.logger.warn(`Invalid referral code: ${safeCode}`);
      return null;
    }

    const referrerId = referrer._id.toString();

    if (referrerId === safeReferredUserId) {
      this.logger.warn('User cannot refer themselves');
      return null;
    }

    if (typeof safeReferredUserId !== 'string')
      throw new BadRequestException('Invalid referredUserId');
    const existingReferral = await this.referralModel
      .findOne({
        referredUserId: safeReferredUserId,
      })
      .lean()
      .select('_id')
      .exec();
    if (existingReferral) {
      this.logger.warn(`User ${safeReferredUserId} already has a referral`);
      return null;
    }

    const referral = await this.referralModel.create({
      referrerId,
      referredUserId: safeReferredUserId,
      status: 'completed',
      completedAt: new Date(),
    });

    if (typeof referredUserId !== 'string')
      throw new BadRequestException('Invalid referredUserId');
    await this.userModel.findByIdAndUpdate(referredUserId, {
      referredBy: referrerId,
    });

    // Sybil bound: multi-accounting is impossible to fully prevent, so cap
    // the number of PAID referrals per referrer per day. The referral itself
    // is still recorded (stats/tiers stay accurate); only the coin payout is
    // withheld beyond the cap.
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const paidToday = await this.referralModel.countDocuments({
      referrerId,
      status: 'completed',
      completedAt: { $gte: startOfDay },
    });
    if (paidToday >= REFERRAL_DAILY_PAYOUT_CAP) {
      this.logger.warn(
        `Referrer ${referrerId} hit daily referral payout cap (${REFERRAL_DAILY_PAYOUT_CAP}) — skipping payout`,
      );
      return referrerId;
    }

    await this.payoutPerReferral(
      referrerId,
      String(referral._id),
      referredUserId,
    );
    await this.checkAndGrantRewards(referrerId);
    return referrerId;
  }

  private async payoutPerReferral(
    referrerId: string,
    referralId: string,
    referredUserId: string,
  ): Promise<void> {
    const amount = await this.economy.getNumber('referral_reward_coins_per');
    if (amount <= 0) return;
    try {
      await this.wallet.credit(
        referrerId,
        'coins',
        amount,
        'referral_bonus',
        `referral-${referralId}-payout-${referrerId}`,
        { referralId, referredUserId },
      );
    } catch (err) {
      this.logger.warn(
        `Referral coin payout failed for ${referrerId} on referral ${referralId}: ${(err as Error).message}`,
      );
    }
  }

  async getReferralStats(userId: string) {
    const [totalReferrals, rewards, referralCode] = await Promise.all([
      this.referralModel.countDocuments({
        referrerId: userId,
        status: 'completed',
      }),
      this.rewardModel.find({ userId }).lean(),
      this.ensureReferralCode(userId),
    ]);

    const nextTier = REWARD_TIERS.find(
      (t) => t.requiredInvites > totalReferrals,
    );

    return {
      referralCode,
      totalReferrals,
      rewards: rewards.map((r) => ({
        rewardId: r.rewardId,
        rewardType: r.rewardType,
        unlockedAt: r.unlockedAt,
        tier: r.tier,
      })),
      tiers: REWARD_TIERS.map((t) => ({
        tier: t.tier,
        requiredInvites: t.requiredInvites,
        rewards: t.rewards.map((r) => ({
          rewardId: r.rewardId,
          rewardType: r.rewardType,
          label: r.label,
        })),
        unlocked: totalReferrals >= t.requiredInvites,
      })),
      nextTier: nextTier
        ? {
            requiredInvites: nextTier.requiredInvites,
            remaining: nextTier.requiredInvites - totalReferrals,
          }
        : null,
    };
  }

  private async checkAndGrantRewards(userId: string): Promise<void> {
    const totalReferrals = await this.referralModel.countDocuments({
      referrerId: userId,
      status: 'completed',
    });

    const eligibleRewards = REWARD_TIERS.filter(
      (t) => totalReferrals >= t.requiredInvites,
    ).flatMap((t) => t.rewards.map((r) => ({ ...r, tier: t.tier })));

    if (eligibleRewards.length === 0) return;

    const rewardIds = eligibleRewards.map((r) => r.rewardId);
    const existingRewards = await this.rewardModel
      .find({ userId, rewardId: { $in: rewardIds } })
      .select('rewardId')
      .lean<{ rewardId: string }[]>()
      .exec();
    const existingSet = new Set(existingRewards.map((r) => r.rewardId));

    const newRewards = eligibleRewards.filter(
      (r) => !existingSet.has(r.rewardId),
    );
    if (newRewards.length > 0) {
      await this.rewardModel.insertMany(
        newRewards.map((r) => ({
          userId,
          rewardId: r.rewardId,
          rewardType: r.rewardType,
          tier: r.tier,
          unlockedAt: new Date(),
        })),
      );
      for (const r of newRewards) {
        this.logger.log(`Granted reward ${r.rewardId} to user ${userId}`);
      }
    }

    for (const tier of REWARD_TIERS) {
      if (totalReferrals >= tier.requiredInvites) {
        await this.payoutTierBonus(userId, tier.tier, tier.requiredInvites);
      }
    }
  }

  private async payoutTierBonus(
    referrerId: string,
    tier: number,
    requiredInvites: number,
  ): Promise<void> {
    const key = this.tierKeys[tier as keyof typeof this.tierKeys];
    if (!key) return;
    const amount = await this.economy.getNumber(key);
    if (amount <= 0) return;
    try {
      await this.wallet.credit(
        referrerId,
        'coins',
        amount,
        'referral_tier_bonus',
        `referral-tier-${referrerId}-${tier}`,
        { tier, requiredInvites },
      );
    } catch (err) {
      this.logger.warn(
        `Referral tier bonus failed for ${referrerId} tier ${tier}: ${(err as Error).message}`,
      );
    }
  }
}
