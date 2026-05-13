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

  onApplicationBootstrap(): void {
    // Hand off the heavy backfill to a background task so Nest binds the HTTP
    // port without waiting for it. New users get starters inline via
    // AuthService; the backfill is only a one-shot for users that existed
    // before this feature shipped.
    setImmediate(() => {
      void this.runBackfill().catch((err) => {
        this.logger.error(
          `Shop inventory bootstrap crashed: ${(err as Error).message}`,
          (err as Error).stack,
        );
      });
    });
  }

  /**
   * Public so tests can drive the backfill synchronously. Production code
   * should NOT call this — `onApplicationBootstrap` schedules it for them.
   */
  async runBackfill(): Promise<void> {
    const starters = listStarterItems();
    if (starters.length === 0) {
      this.logger.log('No starter items defined; bootstrap skipped.');
      return;
    }

    const totalUsers = await this.userModel.estimatedDocumentCount();
    this.logger.log(
      `Shop inventory bootstrap starting (users≈${totalUsers}, starters=${starters.length})`,
    );

    // Find user ids that ALREADY have all starter items in a single aggregation
    // — much cheaper than per-user find. The bootstrap then only iterates the
    // users that are missing at least one starter row.
    const starterIds = starters.map((s) => s.id);
    const usersWithAllStarters = await this.inventoryModel.aggregate<{
      _id: Types.ObjectId;
    }>([
      { $match: { itemId: { $in: starterIds }, acquiredVia: 'starter' } },
      { $group: { _id: '$userId', items: { $addToSet: '$itemId' } } },
      { $match: { items: { $size: starterIds.length } } },
      { $project: { _id: 1 } },
    ]);
    const alreadyOk = new Set(
      usersWithAllStarters.map((row) => row._id.toString()),
    );

    const allUserIds = await this.userModel
      .find({}, { _id: 1 })
      .lean<LeanUserId[]>();
    const todo = allUserIds.filter(({ _id }) => !alreadyOk.has(_id.toString()));

    this.logger.log(
      `Shop inventory bootstrap: ${todo.length} users missing starters, ${alreadyOk.size} already complete`,
    );

    let granted = 0;
    let failed = 0;
    const reportEvery = 100;

    for (const [index, { _id }] of todo.entries()) {
      const userId = _id.toString();
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
      if ((index + 1) % reportEvery === 0) {
        this.logger.log(
          `Shop inventory bootstrap progress: ${index + 1}/${todo.length} processed`,
        );
      }
    }

    this.logger.log(
      `Shop inventory bootstrap complete: granted=${granted}, skipped=${alreadyOk.size}, failed=${failed}`,
    );
  }
}
