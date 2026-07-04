import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, type UserDocument } from '../auth/schemas/user.schema';
import { WalletService } from '../wallet/wallet.service';
import { InventoryService } from '../shop/services/inventory.service';
import { BulkRewardDto, BulkRewardType } from './dto/bulk-reward.dto';

export interface BulkRewardResult {
  totalUsers: number;
  successfulRewards: number;
  failedRewards: number;
  errors: string[];
}

@Injectable()
export class BulkRewardsService {
  private readonly logger = new Logger(BulkRewardsService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly walletService: WalletService,
    private readonly inventoryService: InventoryService,
  ) {}

  async rewardAllUsers(
    dto: BulkRewardDto,
    adminUserId: string,
  ): Promise<BulkRewardResult> {
    if (dto.type === BulkRewardType.ITEM && !dto.itemId) {
      throw new BadRequestException('bulkRewards.itemIdRequired');
    }

    const users = await this.userModel
      .find({ deletedAt: null })
      .select('_id')
      .lean<{ _id: { toString(): string } }[]>();

    const result: BulkRewardResult = {
      totalUsers: users.length,
      successfulRewards: 0,
      failedRewards: 0,
      errors: [],
    };

    const BATCH_SIZE = 100;
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(
        batch.map((user) =>
          this.rewardUser(user._id.toString(), dto, adminUserId),
        ),
      );

      for (const outcome of batchResults) {
        if (outcome.status === 'fulfilled') {
          result.successfulRewards++;
        } else {
          result.failedRewards++;
          const errorMsg =
            outcome.reason instanceof Error
              ? outcome.reason.message
              : 'Unknown error';
          result.errors.push(errorMsg);
        }
      }
    }

    this.logger.log(
      `Bulk reward completed: ${result.successfulRewards}/${result.totalUsers} successful`,
    );

    return result;
  }

  private async rewardUser(
    userId: string,
    dto: BulkRewardDto,
    adminUserId: string,
  ): Promise<void> {
    const idempotencyKey = `bulk-reward-${dto.type}-${dto.amount}-${dto.itemId || 'none'}-${userId}-${Date.now()}`;

    switch (dto.type) {
      case BulkRewardType.COINS:
      case BulkRewardType.GEMS:
      case BulkRewardType.ARCADEUM:
        await this.walletService.credit(
          userId,
          dto.type,
          dto.amount,
          'admin_grant',
          idempotencyKey,
          { adminUserId, reason: dto.reason },
        );
        break;

      case BulkRewardType.ITEM:
        if (!dto.itemId) {
          throw new BadRequestException('bulkRewards.itemIdRequired');
        }
        await this.inventoryService.grant(userId, dto.itemId, idempotencyKey);
        break;

      default:
        throw new BadRequestException('bulkRewards.invalidType');
    }
  }
}
