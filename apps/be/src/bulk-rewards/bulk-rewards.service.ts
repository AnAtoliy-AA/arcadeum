import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createHash } from 'node:crypto';
import { Model } from 'mongoose';
import { ALL_SPECIES, type PetSpecies } from '@arcadeum/games-core';
import { User, type UserDocument } from '../auth/schemas/user.schema';
import { WalletService } from '../wallet/wallet.service';
import { InventoryService } from '../shop/services/inventory.service';
import { ArcadePetCollectionService } from '../arcade-pet/arcade-pet-collection.service';
import { BulkRewardDto, BulkRewardType } from './dto/bulk-reward.dto';

function isPetSpecies(value: string | undefined): value is PetSpecies {
  return (
    value !== undefined && (ALL_SPECIES as readonly string[]).includes(value)
  );
}

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
    private readonly petCollections: ArcadePetCollectionService,
  ) {}

  async rewardAllUsers(
    dto: BulkRewardDto,
    adminUserId: string,
  ): Promise<BulkRewardResult> {
    if (dto.type === BulkRewardType.ITEM && !dto.itemId) {
      throw new BadRequestException('bulkRewards.itemIdRequired');
    }

    if (
      dto.type === BulkRewardType.PET &&
      dto.itemId &&
      !(ALL_SPECIES as readonly string[]).includes(dto.itemId)
    ) {
      throw new BadRequestException('bulkRewards.invalidPetSpecies');
    }

    const operationId =
      dto.operationId?.trim() || `op-${Date.now().toString(36)}`;

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
          this.rewardUser(user._id.toString(), dto, adminUserId, operationId),
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
    operationId: string,
  ): Promise<void> {
    // The idempotency key MUST be stable across retries of the same logical
    // operation, otherwise a partially-failed batch re-run double-pays
    // everyone already credited. Pass `operationId` in the request body when
    // retrying; it is generated once per invocation otherwise.
    const idempotencyKey = `bulk-reward-${dto.type}-${dto.amount}-${dto.itemId || 'none'}-${operationId}-${userId}`;

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

      case BulkRewardType.PET: {
        // The present is the single source of truth for a pet gift; it is
        // idempotent per id so retried runs never double-gift.
        const species: PetSpecies = isPetSpecies(dto.itemId)
          ? dto.itemId
          : 'dragon';
        await this.petCollections.grantPresent(userId, {
          id: `admin-gift-${createHash('sha256').update(idempotencyKey).digest('hex').slice(0, 16)}`,
          senderId: 'admin',
          senderName: 'Arcadeum Admin',
          species,
          theme: 'retro',
          petName: species
            .split('_')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' '),
          message: dto.reason || 'Official Administrator Gift',
          createdAt: Date.now(),
          isOpened: false,
        });
        break;
      }

      default:
        throw new BadRequestException('bulkRewards.invalidType');
    }
  }
}
