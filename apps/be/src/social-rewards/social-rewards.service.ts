import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  SocialRewardClaim,
  SocialRewardClaimDocument,
} from './schemas/social-reward-claim.schema';
import {
  SUPPORTED_SOCIAL_PLATFORMS,
  isSupportedSocialPlatform,
  type SocialPlatform,
} from './social-platforms';
import { WalletService } from '../wallet/wallet.service';
import { EconomySettingsService } from '../economy/economy-settings.service';

export interface SocialRewardStatusItem {
  platform: SocialPlatform;
  gems: number;
  claimed: boolean;
  claimedAt: Date | null;
}

export interface SocialRewardsStatusResponse {
  items: SocialRewardStatusItem[];
  totalClaimed: number;
  totalAvailable: number;
  gemsPerSubscription: number;
}

export interface ClaimSocialRewardResponse {
  success: boolean;
  platform: SocialPlatform;
  gemsAwarded: number;
  gemsBalanceAfter: number;
  claimedAt: Date;
}

@Injectable()
export class SocialRewardsService {
  constructor(
    @InjectModel(SocialRewardClaim.name)
    private readonly claimModel: Model<SocialRewardClaimDocument>,
    private readonly wallet: WalletService,
    private readonly economy: EconomySettingsService,
  ) {}

  private parseUserId(userId: string): Types.ObjectId {
    return Types.ObjectId.isValid(userId)
      ? new Types.ObjectId(userId)
      : (userId as unknown as Types.ObjectId);
  }

  async getStatus(userId: string): Promise<SocialRewardsStatusResponse> {
    const userObjectId = this.parseUserId(userId);
    const rewardGems = await this.economy.getNumber('social_reward_gems');

    const claims = await this.claimModel
      .find({ userId: userObjectId })
      .lean()
      .exec();

    const claimedMap = new Map<string, Date>();
    for (const claim of claims) {
      claimedMap.set(claim.platform, claim.claimedAt);
    }

    const items: SocialRewardStatusItem[] = SUPPORTED_SOCIAL_PLATFORMS.map(
      (platform) => {
        const claimedAt = claimedMap.get(platform) ?? null;
        return {
          platform,
          gems: rewardGems,
          claimed: Boolean(claimedAt),
          claimedAt,
        };
      },
    );

    const totalClaimed = items.filter((item) => item.claimed).length;

    return {
      items,
      totalClaimed,
      totalAvailable: items.length,
      gemsPerSubscription: rewardGems,
    };
  }

  async claimReward(
    userId: string,
    rawPlatform: string,
  ): Promise<ClaimSocialRewardResponse> {
    const platform = rawPlatform.toLowerCase().trim();

    if (!isSupportedSocialPlatform(platform)) {
      throw new BadRequestException('socialRewards.invalidPlatform');
    }

    const userObjectId = this.parseUserId(userId);
    const existing = await this.claimModel
      .findOne({ userId: userObjectId, platform })
      .lean()
      .exec();

    if (existing) {
      throw new ConflictException('socialRewards.alreadyClaimed');
    }

    const gemAmount = await this.economy.getNumber('social_reward_gems');
    const now = new Date();

    const claimDoc = new this.claimModel({
      userId: userObjectId,
      platform,
      gemsAwarded: gemAmount,
      claimedAt: now,
    });

    try {
      await claimDoc.save();
    } catch (err: unknown) {
      const errorObj = err as { code?: number };
      if (errorObj?.code === 11000) {
        throw new ConflictException('socialRewards.alreadyClaimed');
      }
      throw err;
    }

    let balanceAfter = 0;
    if (gemAmount > 0) {
      const tx = await this.wallet.credit(
        userId,
        'gems',
        gemAmount,
        'social_reward',
        `${userId}:social_reward:${platform}`,
        { platform },
      );
      balanceAfter = tx.balanceAfter;
    } else {
      const balance = await this.wallet.getBalance(userId);
      balanceAfter = balance['gems'];
    }

    return {
      success: true,
      platform,
      gemsAwarded: gemAmount,
      gemsBalanceAfter: balanceAfter,
      claimedAt: now,
    };
  }
}
