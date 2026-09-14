import { runInTransaction } from '../../common/utils/transaction.util';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { User, type UserDocument } from '../../auth/schemas/user.schema';
import {
  UserInventoryItem,
  type UserInventoryItemDocument,
} from '../schemas/user-inventory-item.schema';
import {
  ShopAdminAudit,
  type ShopAdminAuditDocument,
} from '../schemas/shop-admin-audit.schema';
import { InventoryService } from './inventory.service';
import { FriendsService } from '../../friends/friends.service';
import { NotificationDispatcher } from '../../notifications/notifications.dispatcher';
import { equipKeyFor } from '../lib/shop-types';
import { getCatalogItem } from '../lib/shop-catalog';
import type { GiftResult } from '../interfaces/shop-views';

interface InventoryRowSnapshot {
  _id: import('mongoose').Types.ObjectId;
  userId: import('mongoose').Types.ObjectId;
  itemId: string;
  purchaseId: string;
  acquiredVia: string;
  paidAmount?: number | null;
  paidCurrency?: string | null;
  soldAt?: Date | null;
  createdAt?: Date;
}

/** Reject NoSQL injection by ensuring the value is a plain string. */
function assertString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new BadRequestException(`shop.invalid${field}`);
  }
  return value;
}

@Injectable()
export class GiftService {
  private readonly logger = new Logger(GiftService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserInventoryItem.name)
    private readonly inventoryModel: Model<UserInventoryItemDocument>,
    @InjectModel(ShopAdminAudit.name)
    private readonly auditModel: Model<ShopAdminAuditDocument>,
    private readonly inventory: InventoryService,
    private readonly friends: FriendsService,
    private readonly dispatcher: NotificationDispatcher,
  ) {}

  async gift(
    senderId: string,
    recipientId: string,
    itemId: string,
    message: string,
  ): Promise<GiftResult> {
    const safeSenderId = assertString(senderId, 'SenderId');
    const safeRecipientId = assertString(recipientId, 'RecipientId');
    const safeItemId = assertString(itemId, 'ItemId');

    if (safeSenderId === safeRecipientId) {
      throw new BadRequestException('shop.cannotGiftSelf');
    }

    const friendIds = await this.friends.getFriendIds(safeSenderId);
    if (!friendIds.includes(safeRecipientId)) {
      throw new ForbiddenException('shop.notFriends');
    }

    const def = getCatalogItem(safeItemId);
    if (!def) throw new NotFoundException('shop.unknownItem');
    if (def.starter === true) {
      throw new BadRequestException('shop.starterNotGift');
    }

    const senderObjId = new Types.ObjectId(safeSenderId);
    const purchaseId = `gift-${safeSenderId}-${safeRecipientId}-${safeItemId}-${Date.now()}`;

    let recipientRow!: InventoryRowSnapshot;

    await runInTransaction(this.connection, async (session) => {
      const row = await this.inventoryModel
        .findOne(
          {
            userId: senderObjId,
            itemId: safeItemId,
            soldAt: null,
          },
          null,
          { session },
        )
        .lean<InventoryRowSnapshot | null>();

      if (!row) throw new BadRequestException('shop.notOwned');

      await this.inventoryModel.updateOne(
        { _id: row._id },
        { $set: { soldAt: new Date() } },
        { session },
      );

      const created = await this.inventoryModel.create(
        [
          {
            userId: new Types.ObjectId(safeRecipientId),
            itemId: def.id,
            purchaseId,
            acquiredVia: 'gift',
            paidAmount: null,
            paidCurrency: null,
          },
        ],
        { session },
      );
      recipientRow = created[0];

      await this.auditModel.create(
        [
          {
            adminUserId: new Types.ObjectId(safeSenderId),
            action: 'grant',
            subjectItemId: def.id,
            subjectUserId: new Types.ObjectId(safeRecipientId),
            reason: `Gift from friend: ${message}`,
          },
        ],
        { session },
      );
    });

    if (def) {
      const equipKey = equipKeyFor(def.category);
      if (equipKey) {
        const senderUser = await this.userModel
          .findById(safeSenderId, { [equipKey]: 1 })
          .lean<{ [key: string]: string | null } | null>();
        if (senderUser && senderUser[equipKey] === safeItemId) {
          await this.inventory.clearEquipIfPointsAt(
            safeSenderId,
            safeItemId,
            def.category,
          );
        }
      }
    }

    const sender = await this.userModel
      .findById(safeSenderId, { username: 1, displayName: 1 })
      .lean<{ username?: string; displayName?: string } | null>();
    const senderName = sender?.displayName || sender?.username || 'A friend';

    void this.dispatcher
      .dispatch({
        userId: safeRecipientId,
        category: 'gift_received',
        titleKey: 'notifications.gift_received.title',
        bodyKey: 'notifications.gift_received.body',
        i18nParams: {
          senderName,
          itemName: def.id,
          nameKey: def.nameKey,
          message,
        },
        url: '/shop/inventory',
        data: {
          itemId: def.id,
          nameKey: def.nameKey,
          senderId: safeSenderId,
          senderName,
          message,
        },
        skipCategoryCheck: true,
      })
      .catch(() => {});

    return {
      inventoryItem: {
        rowId: recipientRow._id.toString(),
        itemId: recipientRow.itemId,
        purchaseId: recipientRow.purchaseId,
        acquiredVia: recipientRow.acquiredVia as
          'coins' | 'gems' | 'arcadeum' | 'grant' | 'starter' | 'gift',
        paidAmount: recipientRow.paidAmount ?? null,
        paidCurrency:
          (recipientRow.paidCurrency as 'coins' | 'gems' | null) ?? null,
        soldAt: recipientRow.soldAt ? recipientRow.soldAt.toISOString() : null,
        createdAt: (recipientRow.createdAt ?? new Date()).toISOString(),
      },
    };
  }
}
