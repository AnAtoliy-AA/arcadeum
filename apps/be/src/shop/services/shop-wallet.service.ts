import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { User, type UserDocument } from '../../auth/schemas/user.schema';
import { WalletService } from '../../wallet/wallet.service';
import { SolanaService } from '../../solana/solana.service';
import {
  UserInventoryItem,
  type UserInventoryItemDocument,
} from '../schemas/user-inventory-item.schema';
import { CatalogService } from './catalog.service';
import { InventoryService } from './inventory.service';
import { equipKeyFor, type ShopCategory } from '../lib/shop-types';
import type { EquippedView, PurchaseResult } from '../interfaces/shop-views';
import type { ClientSession } from 'mongoose';

interface InventoryRowSnapshot {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  itemId: string;
  purchaseId: string;
  acquiredVia: 'coins' | 'gems' | 'arcadeum' | 'grant' | 'starter';
  paidAmount?: number | null;
  paidCurrency?: 'coins' | 'gems' | 'arcadeum' | null;
  soldAt?: Date | null;
  createdAt?: Date;
}

interface EquippedUser {
  _id: Types.ObjectId;
  equippedAvatarId?: string | null;
  equippedBadgeId?: string | null;
  equippedNameColorId?: string | null;
  equippedBannerId?: string | null;
  equippedAuraId?: string | null;
  equippedFrameId?: string | null;
  equippedGameSkinId?: string | null;
  equippedBackgroundId?: string | null;
}

@Injectable()
export class ShopWalletService {
  private readonly logger = new Logger(ShopWalletService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserInventoryItem.name)
    private readonly inventoryModel: Model<UserInventoryItemDocument>,
    private readonly catalog: CatalogService,
    private readonly inventory: InventoryService,
    private readonly wallet: WalletService,
    private readonly solana: SolanaService,
  ) {}

  async purchaseWithWallet(
    userId: string,
    itemId: string,
    purchaseId: string,
    signature: string,
    senderAddress: string,
  ): Promise<PurchaseResult> {
    const prior = await this.inventory.findByUserAndPurchaseId(
      userId,
      purchaseId,
    );
    if (prior) {
      const equipped = await this.loadEquipped(userId);
      const balance = await this.wallet.getBalance(userId);
      return {
        inventoryItem: this.toInventoryItemView(prior),
        equipped,
        balance,
      };
    }

    const effective = await this.catalog.getEffective(itemId);
    if (!effective) throw new BadRequestException('shop.unknownItem');
    if (!effective.available) throw new BadRequestException('shop.unavailable');
    if (effective.priceCurrency !== 'arcadeum') {
      throw new BadRequestException('shop.walletPaymentOnlyForArc');
    }

    const existing = await this.inventory.findLiveByItem(userId, effective.id);
    if (existing) {
      const equipped = await this.ensureEquipped(userId, effective);
      const balance = await this.wallet.getBalance(userId);
      return {
        inventoryItem: this.toInventoryItemView(existing),
        equipped,
        balance,
      };
    }

    const isValid = await this.solana.verifyTransaction(
      signature,
      effective.priceAmount,
      senderAddress,
    );
    if (!isValid) {
      throw new BadRequestException('shop.invalidTransaction');
    }

    let inventoryRow!: InventoryRowSnapshot;
    let equipped: EquippedView = {
      avatar: null,
      badge: null,
      name_color: null,
      game_skin: null,
      banner: null,
      aura: null,
      frame: null,
      background: null,
    };

    await this.connection.transaction(async (session) => {
      const created = await this.inventoryModel.create(
        [
          {
            userId: new Types.ObjectId(userId),
            itemId: effective.id,
            purchaseId,
            acquiredVia: 'arcadeum',
            paidAmount: effective.priceAmount,
            paidCurrency: 'arcadeum',
            walletSignature: signature,
            walletSender: senderAddress,
          },
        ],
        { session },
      );
      inventoryRow = created[0] as unknown as InventoryRowSnapshot;
      equipped = await this.ensureEquipped(userId, effective, session);
    });

    const balance = await this.wallet.getBalance(userId);
    this.wallet.emitAfterCommit(userId, balance);

    return {
      inventoryItem: this.toInventoryItemView(inventoryRow),
      equipped,
      balance,
    };
  }

  private async ensureEquipped(
    userId: string,
    effective: { id: string; category: ShopCategory },
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
      .lean<EquippedUser | null>();
    if (!updated) throw new BadRequestException('users.notFound');
    return this.equippedFromUser(updated);
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
      .lean<EquippedUser | null>();
    return this.equippedFromUser(user);
  }

  private equippedFromUser(
    user: EquippedUser | null | undefined,
  ): EquippedView {
    return {
      avatar: user?.equippedAvatarId ?? null,
      badge: user?.equippedBadgeId ?? null,
      name_color: user?.equippedNameColorId ?? null,
      game_skin: user?.equippedGameSkinId ?? null,
      banner: user?.equippedBannerId ?? null,
      aura: user?.equippedAuraId ?? null,
      frame: user?.equippedFrameId ?? null,
      background: user?.equippedBackgroundId ?? null,
    };
  }

  private toInventoryItemView(row: InventoryRowSnapshot) {
    return {
      rowId: row._id.toString(),
      itemId: row.itemId,
      purchaseId: row.purchaseId,
      acquiredVia: row.acquiredVia,
      paidAmount: row.paidAmount ?? null,
      paidCurrency: row.paidCurrency ?? null,
      soldAt: row.soldAt ? row.soldAt.toISOString() : null,
      createdAt: row.createdAt
        ? row.createdAt.toISOString()
        : new Date().toISOString(),
    };
  }
}
