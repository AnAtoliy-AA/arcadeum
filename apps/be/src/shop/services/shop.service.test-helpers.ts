import { Test } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ShopService } from './shop.service';
import { CatalogService } from './catalog.service';
import { InventoryService } from './inventory.service';
import { WalletService } from '../../wallet/wallet.service';
import { EconomySettingsService } from '../../economy/economy-settings.service';
import { User } from '../../auth/schemas/user.schema';
import { UserInventoryItem } from '../schemas/user-inventory-item.schema';
import { ShopAdminAudit } from '../schemas/shop-admin-audit.schema';

export interface FakeRow {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  itemId: string;
  purchaseId: string;
  acquiredVia: 'coins' | 'gems' | 'grant' | 'starter';
  paidAmount?: number | null;
  paidCurrency?: 'coins' | 'gems' | null;
  soldAt?: Date | null;
  adminUserId?: Types.ObjectId | null;
  adminReason?: string | null;
  revokedBy?: Types.ObjectId | null;
  revokedReason?: string | null;
  createdAt?: Date;
}

export class FakeInventoryModel {
  rows: FakeRow[] = [];

  create(docs: Array<Partial<FakeRow>>): Promise<FakeRow[]> {
    const out: FakeRow[] = [];
    for (const d of docs) {
      const row: FakeRow = {
        _id: new Types.ObjectId(),
        userId: d.userId as Types.ObjectId,
        itemId: d.itemId as string,
        purchaseId: d.purchaseId as string,
        acquiredVia: d.acquiredVia ?? 'coins',
        paidAmount: d.paidAmount ?? null,
        paidCurrency: d.paidCurrency ?? null,
        soldAt: null,
        adminUserId: d.adminUserId ?? null,
        adminReason: d.adminReason ?? null,
        createdAt: new Date(),
      };
      this.rows.push(row);
      out.push(row);
    }
    return Promise.resolve(out);
  }

  findById(id: Types.ObjectId | string) {
    const target = id.toString();
    return {
      lean: () =>
        Promise.resolve(
          this.rows.find((r) => r._id.toString() === target) ?? null,
        ),
    };
  }

  updateOne(
    filter: { _id?: Types.ObjectId },
    update: { $set: Partial<FakeRow> },
  ): Promise<{ modifiedCount: number }> {
    const row = this.rows.find(
      (r) => r._id.toString() === filter._id?.toString(),
    );
    if (row) Object.assign(row, update.$set);
    return Promise.resolve({ modifiedCount: row ? 1 : 0 });
  }
}

export class FakeAuditModel {
  rows: Array<Record<string, unknown>> = [];
  create(input: unknown): Promise<unknown> {
    if (Array.isArray(input)) {
      for (const r of input) this.rows.push(r as Record<string, unknown>);
    } else {
      this.rows.push(input as Record<string, unknown>);
    }
    return Promise.resolve(input);
  }
}

export interface FakeUserDoc {
  _id: Types.ObjectId;
  coins: number;
  gems: number;
  equippedAvatarId?: string | null;
  equippedBadgeId?: string | null;
}

export class FakeUserModel {
  users = new Map<string, FakeUserDoc>();

  findById(id: string | Types.ObjectId) {
    const key = id.toString();
    const docs = this.users;
    return { lean: () => Promise.resolve(docs.get(key) ?? null) };
  }

  findOneAndUpdate(
    filter: Record<string, unknown>,
    update: { $set: Record<string, unknown> },
  ) {
    const id = (filter._id as Types.ObjectId | string).toString();
    return {
      lean: () => {
        const user = this.users.get(id);
        if (!user) return Promise.resolve(null);
        Object.assign(user, update.$set);
        return Promise.resolve(user);
      },
    };
  }

  updateOne(
    filter: Record<string, unknown>,
    update: { $set: Record<string, unknown> },
  ): Promise<{ modifiedCount: number }> {
    const id = (filter._id as Types.ObjectId | string).toString();
    const user = this.users.get(id);
    if (!user) return Promise.resolve({ modifiedCount: 0 });
    for (const [k, v] of Object.entries(filter)) {
      if (k === '_id') continue;
      if ((user as unknown as Record<string, unknown>)[k] !== v) {
        return Promise.resolve({ modifiedCount: 0 });
      }
    }
    Object.assign(user, update.$set);
    return Promise.resolve({ modifiedCount: 1 });
  }
}

export class FakeConnection {
  shouldFail = false;
  async transaction<T>(work: (session: unknown) => Promise<T>): Promise<T> {
    if (this.shouldFail) throw new Error('transaction failed');
    return work({});
  }
}

export interface ShopServiceHarness {
  service: ShopService;
  inventoryModel: FakeInventoryModel;
  auditModel: FakeAuditModel;
  userModel: FakeUserModel;
  connection: FakeConnection;
  wallet: jest.Mocked<WalletService>;
  catalog: jest.Mocked<CatalogService>;
  inventory: jest.Mocked<InventoryService>;
  economy: jest.Mocked<EconomySettingsService>;
  userId: string;
  adminId: string;
}

export async function buildShopHarness(): Promise<ShopServiceHarness> {
  const inventoryModel = new FakeInventoryModel();
  const auditModel = new FakeAuditModel();
  const userModel = new FakeUserModel();
  const connection = new FakeConnection();

  const wallet = {
    debit: jest.fn().mockResolvedValue(undefined),
    credit: jest.fn().mockResolvedValue(undefined),
    getBalance: jest.fn().mockResolvedValue({ coins: 0, gems: 0 }),
    emitAfterCommit: jest.fn(),
  } as unknown as jest.Mocked<WalletService>;

  const catalog = {
    getEffective: jest.fn(),
    setOverride: jest.fn(),
  } as unknown as jest.Mocked<CatalogService>;

  const inventory = {
    findByUserAndPurchaseId: jest.fn().mockResolvedValue(null),
    findLiveByItem: jest.fn().mockResolvedValue(null),
    clearEquipIfPointsAt: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<InventoryService>;

  const economy = {
    getNumber: jest.fn().mockResolvedValue(100),
  } as unknown as jest.Mocked<EconomySettingsService>;

  const userObjId = new Types.ObjectId();
  const userId = userObjId.toString();
  userModel.users.set(userId, {
    _id: userObjId,
    coins: 1000,
    gems: 50,
    equippedAvatarId: null,
    equippedBadgeId: null,
  });
  const adminId = new Types.ObjectId().toString();

  const module = await Test.createTestingModule({
    providers: [
      ShopService,
      { provide: getConnectionToken(), useValue: connection },
      { provide: getModelToken(User.name), useValue: userModel },
      {
        provide: getModelToken(UserInventoryItem.name),
        useValue: inventoryModel,
      },
      { provide: getModelToken(ShopAdminAudit.name), useValue: auditModel },
      { provide: CatalogService, useValue: catalog },
      { provide: InventoryService, useValue: inventory },
      { provide: WalletService, useValue: wallet },
      { provide: EconomySettingsService, useValue: economy },
    ],
  }).compile();

  return {
    service: module.get(ShopService),
    inventoryModel,
    auditModel,
    userModel,
    connection,
    wallet,
    catalog,
    inventory,
    economy,
    userId,
    adminId,
  };
}

export function effectiveItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'avatar-fox-01',
    category: 'avatar' as const,
    rarity: 'common' as const,
    nameKey: 'items.avatar.fox01.name',
    descKey: 'items.avatar.fox01.desc',
    assetUrl: '/shop/avatars/fox-01.png',
    defaultPriceAmount: 200,
    defaultPriceCurrency: 'coins' as const,
    available: true,
    priceAmount: 200,
    priceCurrency: 'coins' as const,
    overridden: false,
    ...overrides,
  };
}
