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

@Injectable()
export class ShopInventoryBootstrap implements OnApplicationBootstrap {
  private readonly logger = new Logger(ShopInventoryBootstrap.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserInventoryItem.name)
    private readonly inventoryModel: Model<UserInventoryItemDocument>,
    private readonly inventory: InventoryService,
  ) {}

  onApplicationBootstrap(): void {
    setImmediate(() => {
      void this.runBackfill().catch((err) => {
        this.logger.error(
          `Shop inventory bootstrap crashed: ${(err as Error).message}`,
          (err as Error).stack,
        );
      });
    });
  }

  async runBackfill(): Promise<void> {
    try {
      const purgeResult = await this.inventoryModel.deleteMany({
        acquiredVia: 'starter',
      });
      if (purgeResult.deletedCount && purgeResult.deletedCount > 0) {
        this.logger.log(
          `Shop inventory bootstrap: Purged ${purgeResult.deletedCount} legacy starter records from user_inventory_items`,
        );
      }
    } catch (err) {
      this.logger.warn(
        `Shop inventory bootstrap: Failed to purge legacy starter rows: ${(err as Error).message}`,
      );
    }

    const starters = listStarterItems();
    if (starters.length === 0) {
      this.logger.log('No starter items defined; bootstrap skipped.');
      return;
    }

    const allUserIds = await this.userModel
      .find({}, { _id: 1 })
      .lean<LeanUserId[]>();

    for (const { _id } of allUserIds) {
      const userId = _id.toString();
      try {
        await this.inventory.grantStarter(userId);
      } catch (err) {
        this.logger.warn(
          `Failed to check equip starters for user ${userId}: ${
            (err as Error).message
          }`,
        );
      }
    }

    this.logger.log(
      `Shop inventory bootstrap complete: synced default equip slots for ${allUserIds.length} users`,
    );
  }
}
