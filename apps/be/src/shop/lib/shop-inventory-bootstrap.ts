import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, type UserDocument } from '../../auth/schemas/user.schema';
import {
  UserInventoryItem,
  type UserInventoryItemDocument,
} from '../schemas/user-inventory-item.schema';
import { InventoryService } from '../services/inventory.service';
import { listStarterItems } from './shop-catalog';

interface LeanUserId {
  _id: Types.ObjectId;
}

/**
 * Backfills starter items for every existing user on application boot.
 * Idempotent: `InventoryService.grantStarter` swallows duplicate-key errors,
 * and the equip-slot updates are conditional on null/undefined.
 *
 * Runs once per boot. New users from this point forward get starter items
 * inline via `AuthService.register` and `AuthService.getOrCreateOAuthUser`.
 */
@Injectable()
export class ShopInventoryBootstrap implements OnApplicationBootstrap {
  private readonly logger = new Logger(ShopInventoryBootstrap.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserInventoryItem.name)
    private readonly inventoryModel: Model<UserInventoryItemDocument>,
    private readonly inventory: InventoryService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const starters = listStarterItems();
    if (starters.length === 0) {
      this.logger.log('No starter items defined; bootstrap skipped.');
      return;
    }

    const userIds = await this.userModel
      .find({}, { _id: 1 })
      .lean<LeanUserId[]>();

    let granted = 0;
    let skipped = 0;
    let failed = 0;

    for (const { _id } of userIds) {
      const userId = _id.toString();
      const ownedItemIds = new Set(
        (
          await this.inventoryModel
            .find({ userId: _id, acquiredVia: 'starter' }, { itemId: 1 })
            .lean<Array<{ itemId: string }>>()
        ).map((r) => r.itemId),
      );
      const hasAllStarters = starters.every((s) => ownedItemIds.has(s.id));
      if (hasAllStarters) {
        skipped += 1;
        continue;
      }
      try {
        await this.inventory.grantStarter(userId);
        granted += 1;
      } catch (err) {
        failed += 1;
        this.logger.warn(
          `Failed to grant starters to user ${userId}: ${
            (err as Error).message
          }`,
        );
      }
    }

    this.logger.log(
      `Shop inventory bootstrap complete: granted=${granted}, skipped=${skipped}, failed=${failed}`,
    );
  }
}
