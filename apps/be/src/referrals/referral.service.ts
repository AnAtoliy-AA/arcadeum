import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Referral } from './schemas/referral.schema';
import { ReferralReward, RewardType } from './schemas/referral-reward.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';

interface RewardTierDefinition {
  tier: number;
  requiredInvites: number;
  rewards: Array<{
    rewardId: string;
    rewardType: RewardType;
    label: string;
  }>;
}

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

  constructor(
    @InjectModel(Referral.name)
    private readonly referralModel: Model<Referral>,
    @InjectModel(ReferralReward.name)
    private readonly rewardModel: Model<ReferralReward>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  generateReferralCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
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

    let code = this.generateReferralCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await this.userModel.findOne({ referralCode: code });
      if (!existing) break;
      code = this.generateReferralCode();
      attempts++;
    }

    user.referralCode = code;
    await user.save();
    return code;
  }

  async trackReferral(
    referralCode: string,
    referredUserId: string,
  ): Promise<void> {
    const referrer = await this.userModel.findOne({ referralCode }).exec();
    if (!referrer) {
      this.logger.warn(`Invalid referral code: ${referralCode}`);
      return;
    }

    const referrerId = (referrer as UserDocument).id as string;

    if (referrerId === referredUserId) {
      this.logger.warn('User cannot refer themselves');
      return;
    }

    const existingReferral = await this.referralModel.findOne({
      referredUserId,
    });
    if (existingReferral) {
      this.logger.warn(`User ${referredUserId} already has a referral`);
      return;
    }

    await this.referralModel.create({
      referrerId,
      referredUserId,
      status: 'completed',
      completedAt: new Date(),
    });

    await this.userModel.findByIdAndUpdate(referredUserId, {
      referredBy: referrerId,
    });

    await this.checkAndGrantRewards(referrerId);
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

    for (const tier of REWARD_TIERS) {
      if (totalReferrals < tier.requiredInvites) continue;

      for (const reward of tier.rewards) {
        const existing = await this.rewardModel.findOne({
          userId,
          rewardId: reward.rewardId,
        });

        if (!existing) {
          await this.rewardModel.create({
            userId,
            rewardId: reward.rewardId,
            rewardType: reward.rewardType,
            tier: tier.tier,
            unlockedAt: new Date(),
          });
          this.logger.log(
            `Granted reward ${reward.rewardId} to user ${userId}`,
          );
        }
      }
    }
  }
}
