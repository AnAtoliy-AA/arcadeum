import {
  BadRequestException,
  Injectable,
  Logger,
  Optional,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { WalletService } from '../wallet/wallet.service';
import { levelFromXp } from './lib/xp-level';
import {
  getCoinsForLevel,
  getRewardForExactLevel,
  grantLevelBadges,
} from './lib/level-rewards';
import {
  UserInventoryItem,
  type UserInventoryItemDocument,
} from '../shop/schemas/user-inventory-item.schema';

export interface LevelRewardsStatus {
  currentLevel: number;
  claimedLevel: number;
  unclaimedLevels: number[];
  pendingCoins: number;
  pendingBadges: string[];
}

export interface ClaimLevelRewardsResult {
  currentLevel: number;
  claimedLevel: number;
  coinsAwarded: number;
  badgesAwarded: string[];
  alreadyClaimed: boolean;
}

@Injectable()
export class LevelRewardsService {
  private readonly logger = new Logger(LevelRewardsService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly walletService: WalletService,
    @Optional()
    @InjectModel(UserInventoryItem.name)
    private readonly inventoryModel?: Model<UserInventoryItemDocument>,
  ) {}

  async getStatus(userId: string): Promise<LevelRewardsStatus> {
    const user = await this.userModel
      .findById(userId)
      .select('xp claimedLevel')
      .lean<{ xp?: number; claimedLevel?: number } | null>();

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const currentLevel = levelFromXp(user.xp ?? 0);
    const claimedLevel = user.claimedLevel ?? 0;

    if (claimedLevel >= currentLevel) {
      return {
        currentLevel,
        claimedLevel,
        unclaimedLevels: [],
        pendingCoins: 0,
        pendingBadges: [],
      };
    }

    const unclaimedLevels: number[] = [];
    let pendingCoins = 0;
    const pendingBadges: string[] = [];

    for (let lvl = claimedLevel + 1; lvl <= currentLevel; lvl++) {
      unclaimedLevels.push(lvl);
      pendingCoins += getCoinsForLevel(lvl);
      const badgeReward = getRewardForExactLevel(lvl);
      if (badgeReward) {
        pendingBadges.push(badgeReward.badgeId);
      }
    }

    return {
      currentLevel,
      claimedLevel,
      unclaimedLevels,
      pendingCoins,
      pendingBadges,
    };
  }

  async claim(userId: string): Promise<ClaimLevelRewardsResult> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const currentLevel = levelFromXp(user.xp ?? 0);
    const claimedLevel = user.claimedLevel ?? 0;

    if (claimedLevel >= currentLevel) {
      return {
        currentLevel,
        claimedLevel,
        coinsAwarded: 0,
        badgesAwarded: [],
        alreadyClaimed: true,
      };
    }

    let coinsAwarded = 0;
    const badgesAwarded: string[] = [];

    for (let lvl = claimedLevel + 1; lvl <= currentLevel; lvl++) {
      coinsAwarded += getCoinsForLevel(lvl);
      const badgeReward = getRewardForExactLevel(lvl);
      if (badgeReward) {
        badgesAwarded.push(badgeReward.badgeId);
      }
    }

    if (coinsAwarded > 0) {
      const idempotencyKey = `level-reward-${userId}-${claimedLevel}-${currentLevel}`;
      await this.walletService.credit(
        userId,
        'coins',
        coinsAwarded,
        'level_reward',
        idempotencyKey,
        { fromLevel: claimedLevel + 1, toLevel: currentLevel },
      );
    }

    if (this.inventoryModel) {
      await grantLevelBadges(userId, currentLevel, this.inventoryModel);
    }

    user.claimedLevel = currentLevel;
    await user.save();

    return {
      currentLevel,
      claimedLevel: currentLevel,
      coinsAwarded,
      badgesAwarded,
      alreadyClaimed: false,
    };
  }
}
