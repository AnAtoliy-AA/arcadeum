import { runInTransaction } from '../../common/utils/transaction.util';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { User, type UserDocument } from '../../auth/schemas/user.schema';
import { WalletService } from '../../wallet/wallet.service';
import { SolanaService } from '../../solana/solana.service';
import { ArcPaymentService } from '../../solana/lib/arc-payment.service';
import { EconomySettingsService } from '../../economy/economy-settings.service';
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
  acquiredVia: 'coins' | 'gems' | 'arcadeum' | 'grant' | 'starter' | 'gift';
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
    private readonly arcPayment: ArcPaymentService,
    private readonly economy: EconomySettingsService,
  ) {}

  async purchaseWithWallet(
    userId: string,
    itemId: string,
    purchaseId: string,
    signature: string,
    senderAddress?: string,
  ): Promise<PurchaseResult> {
    if ((await this.economy.getNumber('shop_allow_arcadeum')) !== 1) {
      throw new BadRequestException('shop.arcPaymentDisabled');
    }

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

    // Solana signatures are public chain data — reject any signature that
    // has already been redeemed by anyone, for any item (cross-user and
    // one-to-many replay protection). `$eq` forces literal comparison so a
    // non-string payload can never be interpreted as a query operator.
    const redeemed = await this.inventoryModel
      .findOne({ walletSignature: { $eq: signature } })
      .lean()
      .exec();
    if (redeemed) {
      throw new BadRequestException('shop.signatureAlreadyUsed');
    }

    const effective = await this.catalog.getEffective(itemId);
    if (!effective) throw new BadRequestException('shop.unknownItem');
    if (!effective.available) throw new BadRequestException('shop.unavailable');
    const expectedAmount = await this.arcAmountFor(effective);

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

    await this.arcPayment.verifyAndRedeem({
      userId,
      signature,
      senderAddress,
      expectedAmount,
      kind: 'shop',
      subjectId: effective.id,
    });

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

    await runInTransaction(this.connection, async (session) => {
      const created = await this.inventoryModel
        .create(
          [
            {
              userId: new Types.ObjectId(userId),
              itemId: effective.id,
              purchaseId,
              acquiredVia: 'arcadeum',
              paidAmount: expectedAmount,
              paidCurrency: 'arcadeum',
              walletSignature: signature,
              walletSender: senderAddress ?? null,
            },
          ],
          { session },
        )
        .catch((err: unknown) => {
          // Concurrent request won the race on the unique walletSignature
          // index (or purchaseId index) — surface a clean replay error.
          if (err instanceof Error && err.message.includes('E11000')) {
            throw new BadRequestException('shop.signatureAlreadyUsed');
          }
          throw err;
        });
      inventoryRow = created[0];
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

  /**
   * ARC owed for an item. ARC-priced items cost their price; gem-priced items
   * can also be paid in ARC at the same quote the shop UI shows:
   * ceil(gems * gem_to_usd_rate * (1 - discount) / ARC price). A price that is
   * unavailable or stale (0) refuses the quote instead of guessing.
   */
  private async arcAmountFor(effective: {
    priceCurrency: string;
    priceAmount: number;
  }): Promise<number> {
    if (effective.priceCurrency === 'arcadeum') return effective.priceAmount;
    if (effective.priceCurrency !== 'gems') {
      throw new BadRequestException('shop.walletPaymentOnlyForArc');
    }
    const [gemToUsd, discount, arcUsd] = await Promise.all([
      this.economy.getNumber('gem_to_usd_rate'),
      this.economy.getNumber('arcadeum_discount_percent'),
      this.solana.getArcadeumPrice(),
    ]);
    if (arcUsd <= 0) throw new BadRequestException('shop.arcPriceUnavailable');
    return Math.ceil(
      (effective.priceAmount * gemToUsd * (1 - discount / 100)) / arcUsd,
    );
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
