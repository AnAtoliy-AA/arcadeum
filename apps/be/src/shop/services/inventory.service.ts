import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { User, type UserDocument } from '../../auth/schemas/user.schema';
import { getCatalogItem, listStarterItems } from '../lib/shop-catalog';
import { equipKeyFor, type ShopCategory } from '../lib/shop-types';
import {
  UserInventoryItem,
  type UserInventoryItemDocument,
} from '../schemas/user-inventory-item.schema';
import type {
  EquippedView,
  InventoryItemView,
  InventoryView,
} from '../interfaces/shop-views';

interface LeanInventoryRow {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  itemId: string;
  purchaseId: string;
  acquiredVia: 'coins' | 'gems' | 'grant' | 'starter';
  paidAmount?: number | null;
  paidCurrency?: 'coins' | 'gems' | null;
  soldAt?: Date | null;
  createdAt?: Date;
}

interface LeanUser {
  equippedAvatarId?: string | null;
  equippedBadgeId?: string | null;
  equippedNameColorId?: string | null;
}

const STARTER_PURCHASE_PREFIX = 'starter';

function starterPurchaseId(userId: string, itemId: string): string {
  return `${STARTER_PURCHASE_PREFIX}-${userId}-${itemId}`;
}

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserInventoryItem.name)
    private readonly inventoryModel: Model<UserInventoryItemDocument>,
  ) {}

  async listForUser(userId: string): Promise<InventoryView> {
    // Inventory rows store userId as a BSON ObjectId (see schema). Mongoose's
    // string-to-ObjectId auto-cast on `find()` is unreliable here — observed
    // empty results in the dev DB even with a valid 24-char hex. Explicit
    // cast guarantees the match. Same pattern applied to every read path.
    const userObjId = new Types.ObjectId(userId);
    const [rows, user] = await Promise.all([
      this.inventoryModel
        .find({ userId: userObjId, soldAt: null })
        .sort({ createdAt: -1 })
        .lean<LeanInventoryRow[]>(),
      this.userModel
        .findById(userId, {
          equippedAvatarId: 1,
          equippedBadgeId: 1,
          equippedNameColorId: 1,
        })
        .lean<LeanUser>(),
    ]);
    return {
      items: rows.map(this.toView),
      equipped: this.equippedFromUser(user),
    };
  }

  async owns(
    userId: string,
    itemId: string,
    session?: ClientSession,
  ): Promise<boolean> {
    const userObjId = new Types.ObjectId(userId);
    const row = await this.inventoryModel
      .findOne({ userId: userObjId, itemId, soldAt: null }, null, { session })
      .lean();
    return row !== null;
  }

  async findLiveByItem(
    userId: string,
    itemId: string,
    session?: ClientSession,
  ): Promise<LeanInventoryRow | null> {
    const userObjId = new Types.ObjectId(userId);
    return this.inventoryModel
      .findOne({ userId: userObjId, itemId, soldAt: null }, null, { session })
      .lean<LeanInventoryRow | null>();
  }

  async findByUserAndPurchaseId(
    userId: string,
    purchaseId: string,
    session?: ClientSession,
  ): Promise<LeanInventoryRow | null> {
    const userObjId = new Types.ObjectId(userId);
    return this.inventoryModel
      .findOne({ userId: userObjId, purchaseId }, null, { session })
      .lean<LeanInventoryRow | null>();
  }

  async grantStarter(userId: string, session?: ClientSession): Promise<void> {
    const starters = listStarterItems();
    if (starters.length === 0) return;

    for (const item of starters) {
      const purchaseId = starterPurchaseId(userId, item.id);
      try {
        await this.inventoryModel.create(
          [
            {
              userId: new Types.ObjectId(userId),
              itemId: item.id,
              purchaseId,
              acquiredVia: 'starter',
              paidAmount: null,
              paidCurrency: null,
            },
          ],
          { session },
        );
      } catch (err) {
        if (this.isDuplicateKey(err)) {
          continue; // already granted — idempotent
        }
        throw err;
      }
    }

    // Set equip slots only if currently null. Use unconditional $set with a
    // filter that targets only null/missing values so re-runs don't clobber a
    // user's later equip choice.
    const avatarStarter = starters.find((s) => s.category === 'avatar');
    const badgeStarter = starters.find((s) => s.category === 'badge');
    const userObjId = new Types.ObjectId(userId);
    if (avatarStarter) {
      await this.userModel.updateOne(
        { _id: userObjId, equippedAvatarId: { $in: [null, undefined] } },
        { $set: { equippedAvatarId: avatarStarter.id } },
        { session },
      );
    }
    if (badgeStarter) {
      await this.userModel.updateOne(
        { _id: userObjId, equippedBadgeId: { $in: [null, undefined] } },
        { $set: { equippedBadgeId: badgeStarter.id } },
        { session },
      );
    }
  }

  // Equip / unequip freshness contract:
  //  - /chat (player-to-player): live — equipped IDs are read on every page
  //    of messages via the chat helper's batched User lookup.
  //  - Lobby roster (room.members): next room emit picks it up. We don't push
  //    a refresh on equip because in-lobby equipping is rare and the join /
  //    leave / options-change traffic already produces a fresh summary within
  //    seconds. Adding a cross-module socket emit from Shop → Games would
  //    invert a dependency for marginal UX gain.
  //  - Leaderboards: stale up to 30s (LeaderboardsCacheService TTL). Same
  //    trade-off — capture and the 30s timer refresh equipped state.
  //  - Header / ProfileMenu / /shop / /players/[id]: live — these read the
  //    session snapshot or refetch on every render.
  async equip(userId: string, itemId: string): Promise<EquippedView> {
    const def = getCatalogItem(itemId);
    if (!def) throw new BadRequestException('shop.unknownItem');
    const equipKey = equipKeyFor(def.category);
    if (!equipKey) throw new BadRequestException('shop.categoryNotEquippable');

    let updatedUser: LeanUser | null = null;
    await this.connection.transaction(async (session) => {
      const owned = await this.owns(userId, itemId, session);
      if (!owned) throw new BadRequestException('shop.notOwned');
      const result = await this.userModel
        .findOneAndUpdate(
          { _id: userId },
          { $set: { [equipKey]: itemId } },
          {
            session,
            new: true,
            projection: {
              equippedAvatarId: 1,
              equippedBadgeId: 1,
              equippedNameColorId: 1,
            },
          },
        )
        .lean<LeanUser | null>();
      if (!result) throw new NotFoundException('users.notFound');
      updatedUser = result;
    });
    return this.equippedFromUser(updatedUser);
  }

  async unequip(userId: string, category: ShopCategory): Promise<EquippedView> {
    const equipKey = equipKeyFor(category);
    if (!equipKey) throw new BadRequestException('shop.categoryNotEquippable');
    const result = await this.userModel
      .findOneAndUpdate(
        { _id: userId },
        { $set: { [equipKey]: null } },
        {
          new: true,
          projection: {
            equippedAvatarId: 1,
            equippedBadgeId: 1,
            equippedNameColorId: 1,
          },
        },
      )
      .lean<LeanUser | null>();
    if (!result) throw new NotFoundException('users.notFound');
    return this.equippedFromUser(result);
  }

  /**
   * Used by ShopService.revoke to clear an equip slot only when the slot
   * currently points at the item being revoked. Runs inside an external txn.
   */
  async clearEquipIfPointsAt(
    userId: string,
    itemId: string,
    category: ShopCategory,
    session: ClientSession,
  ): Promise<void> {
    const equipKey = equipKeyFor(category);
    if (!equipKey) return;
    await this.userModel.updateOne(
      { _id: userId, [equipKey]: itemId },
      { $set: { [equipKey]: null } },
      { session },
    );
  }

  private equippedFromUser(user: LeanUser | null | undefined): EquippedView {
    return {
      avatar: user?.equippedAvatarId ?? null,
      badge: user?.equippedBadgeId ?? null,
      name_color: user?.equippedNameColorId ?? null,
      game_skin: null,
    };
  }

  private toView = (row: LeanInventoryRow): InventoryItemView => ({
    rowId: row._id.toString(),
    itemId: row.itemId,
    purchaseId: row.purchaseId,
    acquiredVia: row.acquiredVia,
    paidAmount: row.paidAmount ?? null,
    paidCurrency: row.paidCurrency ?? null,
    soldAt: row.soldAt ? row.soldAt.toISOString() : null,
    createdAt: row.createdAt
      ? row.createdAt.toISOString()
      : new Date(0).toISOString(),
  });

  private isDuplicateKey(err: unknown): boolean {
    if (err === null || typeof err !== 'object') return false;
    const e = err as { code?: number; codeName?: string };
    return e.code === 11000 || e.codeName === 'DuplicateKey';
  }
}
