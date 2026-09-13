import { runInTransaction } from '../../common/utils/transaction.util';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { User, type UserDocument } from '../../auth/schemas/user.schema';
import { WalletService } from '../../wallet/wallet.service';
import { EconomySettingsService } from '../../economy/economy-settings.service';
import {
  UserInventoryItem,
  type UserInventoryItemDocument,
} from '../schemas/user-inventory-item.schema';
import {
  ShopAdminAudit,
  type ShopAdminAuditDocument,
} from '../schemas/shop-admin-audit.schema';
import { CatalogService } from './catalog.service';
import { InventoryService } from './inventory.service';
import { NotificationDispatcher } from '../../notifications/notifications.dispatcher';
import { equipKeyFor } from '../lib/shop-types';
import { getCatalogItem } from '../lib/shop-catalog';
import { equippedFromUser, toInventoryItemView } from '../lib/shop-views.util';
import type {
  EquippedView,
  GrantResult,
  InventoryRowSnapshot,
  LeanUser,
  PurchaseResult,
  RevokeResult,
  SellResult,
} from '../interfaces/shop-views';

@Injectable()
export class ShopService {
  private readonly logger = new Logger(ShopService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserInventoryItem.name)
    private readonly inventoryModel: Model<UserInventoryItemDocument>,
    @InjectModel(ShopAdminAudit.name)
    private readonly auditModel: Model<ShopAdminAuditDocument>,
    private readonly catalog: CatalogService,
    private readonly inventory: InventoryService,
    private readonly wallet: WalletService,
    private readonly economy: EconomySettingsService,
    private readonly dispatcher: NotificationDispatcher,
  ) {}

  async purchase(
    userId: string,
    itemId: string,
    purchaseId: string,
  ): Promise<PurchaseResult> {
    // Application-layer short-circuit: if this purchaseId already exists,
    // return the prior row. WalletService's own duplicate-key recovery is
    // gated on !parentSession, so we cannot rely on it inside the txn.
    const prior = await this.inventory.findByUserAndPurchaseId(
      userId,
      purchaseId,
    );
    if (prior) {
      const equipped = await this.loadEquipped(userId);
      const balance = await this.wallet.getBalance(userId);
      return {
        inventoryItem: toInventoryItemView(prior),
        equipped,
        balance,
      };
    }

    const effective = await this.catalog.getEffective(itemId);
    if (!effective) throw new NotFoundException('shop.unknownItem');
    if (effective.category === 'badge')
      throw new BadRequestException('shop.badgeNotPurchasable');
    if (!effective.available) throw new BadRequestException('shop.unavailable');

    // Ownership short-circuit: the per-purchaseId dedup above only catches
    // exact retries of the same client nonce. Without this second check a
    // fresh nonce would debit again and create a duplicate live row.
    const existing = await this.inventory.findLiveByItem(userId, effective.id);
    if (existing) {
      const equipped = await this.ensureEquipped(userId, effective);
      const balance = await this.wallet.getBalance(userId);
      return {
        inventoryItem: toInventoryItemView(existing),
        equipped,
        balance,
      };
    }

    let inventoryRow!: InventoryRowSnapshot;
    let equipped: EquippedView = equippedFromUser(null);

    await runInTransaction(this.connection, async (session) => {
      // Re-check INSIDE the transaction — without this two concurrent
      // purchases could both debit (TOCTOU double-debit).
      const existingInTxn = await this.inventory.findLiveByItem(
        userId,
        effective.id,
        session,
      );
      if (existingInTxn) {
        inventoryRow = existingInTxn;
        equipped = await this.ensureEquipped(userId, effective, session);
        return;
      }

      // 1. Wallet debit (parentSession).
      const reason =
        effective.priceCurrency === 'arcadeum'
          ? 'shop_purchase_arc'
          : 'shop_purchase';
      await this.wallet.debit(
        userId,
        effective.priceCurrency,
        effective.priceAmount,
        reason,
        `shop-buy-${purchaseId}`,
        { itemId: effective.id },
        session,
      );

      // 2. Inventory row.
      const created = await this.inventoryModel.create(
        [
          {
            userId: new Types.ObjectId(userId),
            itemId: effective.id,
            purchaseId,
            acquiredVia: effective.priceCurrency,
            paidAmount: effective.priceAmount,
            paidCurrency: effective.priceCurrency,
          },
        ],
        { session },
      );
      inventoryRow = created[0] as unknown as InventoryRowSnapshot;

      // 3. Equip slot for any equippable category.
      equipped = await this.ensureEquipped(userId, effective, session);
    });

    const balance = await this.wallet.getBalance(userId);
    this.wallet.emitAfterCommit(userId, balance);

    return {
      inventoryItem: toInventoryItemView(inventoryRow),
      equipped,
      balance,
    };
  }

  async sellBack(userId: string, purchaseId: string): Promise<SellResult> {
    const row = await this.inventory.findByUserAndPurchaseId(
      userId,
      purchaseId,
    );
    if (!row) throw new NotFoundException('shop.unknownPurchase');
    if (row.userId.toString() !== userId) {
      throw new NotFoundException('shop.unknownPurchase');
    }
    if (row.soldAt) throw new BadRequestException('shop.alreadySold');

    const def = getCatalogItem(row.itemId);
    // If the catalog has dropped the item, allow sell-back at paidAmount-only
    // (no override price applies). If def is missing AND starter — reject.
    if (def?.starter === true) {
      throw new BadRequestException('shop.starterNotSellable');
    }

    // Equip check — sold item must not be currently equipped.
    if (def) {
      const equipKey = equipKeyFor(def.category);
      if (equipKey) {
        const user = await this.userModel
          .findById(userId, {
            equippedAvatarId: 1,
            equippedBadgeId: 1,
            equippedNameColorId: 1,
            equippedBannerId: 1,
            equippedAuraId: 1,
            equippedFrameId: 1,
            equippedGameSkinId: 1,
            equippedBackgroundId: 1,
          })
          .lean<LeanUser | null>();
        if (!user) throw new NotFoundException('users.notFound');
        if (user[equipKey] === row.itemId) {
          throw new BadRequestException('shop.unequipFirst');
        }
      }
    }

    // Refund: always paid in coins. Gem items convert via the economy rate.
    const paidAmount = row.paidAmount ?? 0;
    const paidCurrency = row.paidCurrency ?? 'coins';
    if (paidAmount <= 0) {
      // Free items (starters already rejected above) have nothing to refund.
      throw new BadRequestException('shop.noRefundDue');
    }
    let refundAmount: number;
    if (paidCurrency === 'coins') {
      refundAmount = Math.floor(paidAmount * 0.5);
    } else {
      const rate = await this.economy.getNumber('gem_to_coin_rate');
      refundAmount = Math.floor(paidAmount * rate * 0.5);
    }
    if (refundAmount <= 0) {
      throw new BadRequestException('shop.noRefundDue');
    }

    await runInTransaction(this.connection, async (session) => {
      await this.wallet.credit(
        userId,
        'coins',
        refundAmount,
        'shop_sell_refund',
        `shop-sell-${purchaseId}`,
        { itemId: row.itemId },
        session,
      );
      await this.inventoryModel.updateOne(
        { _id: row._id },
        { $set: { soldAt: new Date() } },
        { session },
      );
    });

    const balance = await this.wallet.getBalance(userId);
    this.wallet.emitAfterCommit(userId, balance);

    return {
      rowId: row._id.toString(),
      refundAmount,
      refundCurrency: 'coins',
      balance,
    };
  }

  async grant(
    userId: string,
    itemId: string,
    adminUserId: string,
    reason: string,
    nonce: string,
  ): Promise<GrantResult> {
    const effective = await this.catalog.getEffective(itemId);
    if (!effective) throw new NotFoundException('shop.unknownItem');

    const purchaseId = `shop-grant-${nonce}`;

    let row!: InventoryRowSnapshot;
    await runInTransaction(this.connection, async (session) => {
      // Dedup on (userId, purchaseId). If a prior row exists with the same
      // nonce, short-circuit to it.
      const prior = await this.inventory.findByUserAndPurchaseId(
        userId,
        purchaseId,
        session,
      );
      if (prior) {
        row = prior;
        return;
      }
      const created = await this.inventoryModel.create(
        [
          {
            userId: new Types.ObjectId(userId),
            itemId: effective.id,
            purchaseId,
            acquiredVia: 'grant',
            paidAmount: null,
            paidCurrency: null,
            adminUserId: new Types.ObjectId(adminUserId),
            adminReason: reason,
          },
        ],
        { session },
      );
      row = created[0] as unknown as InventoryRowSnapshot;
      await this.auditModel.create(
        [
          {
            adminUserId: new Types.ObjectId(adminUserId),
            action: 'grant',
            subjectItemId: effective.id,
            subjectUserId: new Types.ObjectId(userId),
            reason,
          },
        ],
        { session },
      );
    });

    const adminUser = await this.userModel
      .findById(adminUserId, { username: 1, displayName: 1 })
      .lean<{ username?: string; displayName?: string } | null>();
    const senderName = adminUser?.displayName || adminUser?.username || 'Admin';

    void this.dispatcher
      .dispatch({
        userId,
        category: 'gift_received',
        titleKey: 'notifications.gift_received.title',
        bodyKey: 'notifications.gift_received.body',
        i18nParams: {
          senderName,
          itemName: effective.id,
          nameKey: effective.nameKey,
          message: reason,
        },
        url: '/shop/inventory',
        data: {
          itemId: effective.id,
          nameKey: effective.nameKey,
          senderId: adminUserId,
          senderName,
          message: reason,
        },
        skipCategoryCheck: true,
      })
      .catch(() => {});

    return { inventoryItem: toInventoryItemView(row) };
  }

  async revoke(
    rowId: string,
    adminUserId: string,
    reason: string,
  ): Promise<RevokeResult> {
    const row = await this.inventoryModel
      .findById(rowId)
      .lean<InventoryRowSnapshot | null>();
    if (!row) throw new NotFoundException('shop.unknownInventoryRow');
    if (row.soldAt) throw new BadRequestException('shop.alreadySold');

    const def = getCatalogItem(row.itemId);
    const userIdString = row.userId.toString();

    await runInTransaction(this.connection, async (session) => {
      await this.inventoryModel.updateOne(
        { _id: row._id },
        {
          $set: {
            soldAt: new Date(),
            revokedBy: new Types.ObjectId(adminUserId),
            revokedReason: reason,
          },
        },
        { session },
      );
      if (def) {
        await this.inventory.clearEquipIfPointsAt(
          userIdString,
          row.itemId,
          def.category,
          session,
        );
      }
      await this.auditModel.create(
        [
          {
            adminUserId: new Types.ObjectId(adminUserId),
            action: 'revoke',
            subjectItemId: row.itemId,
            subjectUserId: row.userId,
            reason,
          },
        ],
        { session },
      );
    });

    const equipped = await this.loadEquipped(userIdString);
    const refreshed = await this.inventoryModel
      .findById(row._id)
      .lean<InventoryRowSnapshot | null>();
    return {
      inventoryItem: toInventoryItemView(refreshed ?? row),
      equipped,
    };
  }

  async setOverride(
    itemId: string,
    patch: {
      available?: boolean | null;
      priceAmount?: number | null;
      priceCurrency?: 'coins' | 'gems' | 'arcadeum' | null;
    },
    adminUserId: string,
  ): Promise<{ override: import('../lib/shop-types').EffectiveShopItem }> {
    const before = await this.catalog.getEffective(itemId);
    const after = await this.catalog.setOverride(itemId, patch, adminUserId);
    await this.auditModel.create({
      adminUserId: new Types.ObjectId(adminUserId),
      action: 'override',
      subjectItemId: itemId,
      fromValue: before
        ? {
            available: before.available,
            priceAmount: before.priceAmount,
            priceCurrency: before.priceCurrency,
          }
        : null,
      toValue: {
        available: after.available,
        priceAmount: after.priceAmount,
        priceCurrency: after.priceCurrency,
      },
    });
    return { override: after };
  }

  // Shared by the purchase happy-path and the already-owned short-circuit.
  // For equippable categories (avatar / badge / name_color) sets the slot to
  // this item; for game_skin (no equip slot) just returns the current loadout.
  private async ensureEquipped(
    userId: string,
    effective: {
      id: string;
      category: import('../lib/shop-types').ShopCategory;
    },
    session?: ClientSession,
  ): Promise<EquippedView> {
    const equipKey = equipKeyFor(effective.category);
    if (!equipKey) {
      return this.loadEquipped(userId, session);
    }
    const updated = await this.userModel
      .findOneAndUpdate(
        { _id: userId },
        { $set: { [equipKey]: effective.id } },
        {
          session,
          new: true,
          projection: {
            equippedAvatarId: 1,
            equippedBadgeId: 1,
            equippedNameColorId: 1,
            equippedBannerId: 1,
            equippedAuraId: 1,
            equippedFrameId: 1,
            equippedGameSkinId: 1,
            equippedBackgroundId: 1,
          },
        },
      )
      .lean<LeanUser | null>();
    if (!updated) throw new NotFoundException('users.notFound');
    return equippedFromUser(updated);
  }

  private async loadEquipped(
    userId: string,
    session?: ClientSession,
  ): Promise<EquippedView> {
    const user = await this.userModel
      .findById(
        userId,
        {
          equippedAvatarId: 1,
          equippedBadgeId: 1,
          equippedNameColorId: 1,
          equippedBannerId: 1,
          equippedAuraId: 1,
          equippedFrameId: 1,
          equippedGameSkinId: 1,
          equippedBackgroundId: 1,
        },
        { session },
      )
      .lean<LeanUser | null>();
    return equippedFromUser(user);
  }
}
