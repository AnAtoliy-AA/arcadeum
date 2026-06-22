import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { Model, Types } from 'mongoose';

jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn().mockImplementation(() => ({})),
  PublicKey: jest.fn().mockImplementation((key: string) => ({
    toBase58: () => key,
    equals: (other: { toBase58: () => string }) => other?.toBase58?.() === key,
  })),
  Keypair: { generate: jest.fn() },
  Transaction: jest.fn(),
  SystemProgram: { transfer: jest.fn() },
  LAMPORTS_PER_SOL: 1_000_000_000,
}));

jest.mock('@solana/spl-token', () => ({
  createTransferInstruction: jest.fn(),
  getAssociatedTokenAddress: jest.fn(),
  getAccount: jest.fn(),
}));

jest.mock('../solana/lib/solana-keypair', () => ({
  getPlatformKeypair: jest.fn(),
}));

import { BattlePassService } from './battle-pass.service';
import {
  BattlePassProgress,
  BattlePassProgressSchema,
} from './schemas/battle-pass-progress.schema';
import { WalletModule } from '../wallet/wallet.module';
import { WalletService } from '../wallet/wallet.service';
import { WalletGateway } from '../wallet/wallet.gateway';
import {
  WalletTransaction,
  WalletTransactionDocument,
} from '../wallet/schemas/wallet-transaction.schema';
import { ShopModule } from '../shop/shop.module';
import { InventoryService } from '../shop/services/inventory.service';
import {
  UserInventoryItem,
  UserInventoryItemDocument,
} from '../shop/schemas/user-inventory-item.schema';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { GameHistoryStatsService } from '../games/history/game-history-stats.service';

// Real Mongo + real WalletService/InventoryService — proves a claim actually
// credits the wallet and grants the cosmetic, and that it's idempotent. XP is
// stubbed (the stats source) so all tiers are unlocked deterministically.
describe('BattlePassService (integration)', () => {
  let replSet: MongoMemoryReplSet;
  let service: BattlePassService;
  let wallet: WalletService;
  let inventory: InventoryService;
  let userModel: Model<User>;
  let txModel: Model<WalletTransactionDocument>;
  let invModel: Model<UserInventoryItemDocument>;

  beforeAll(async () => {
    replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(replSet.getUri()),
        MongooseModule.forFeature([
          { name: BattlePassProgress.name, schema: BattlePassProgressSchema },
          { name: User.name, schema: UserSchema },
        ]),
        AuthModule,
        WalletModule,
        ShopModule,
      ],
      providers: [
        BattlePassService,
        {
          // Stub the XP source so every tier is unlocked.
          provide: GameHistoryStatsService,
          useValue: {
            getPlayerStats: jest.fn(() =>
              Promise.resolve({
                totalGames: 500,
                wins: 400,
                losses: 100,
                winRate: 80,
                byGameType: [],
              }),
            ),
          },
        },
      ],
    })
      .overrideProvider(WalletGateway)
      .useValue({ emitBalance: jest.fn(), emitAfterCommit: jest.fn() })
      .compile();

    service = moduleRef.get(BattlePassService);
    wallet = moduleRef.get(WalletService);
    inventory = moduleRef.get(InventoryService);
    userModel = moduleRef.get<Model<User>>(getModelToken(User.name));
    txModel = moduleRef.get<Model<WalletTransactionDocument>>(
      getModelToken(WalletTransaction.name),
    );
    invModel = moduleRef.get<Model<UserInventoryItemDocument>>(
      getModelToken(UserInventoryItem.name),
    );
    // Enforce the unique idempotency / purchase indexes that make grants safe.
    await txModel.syncIndexes();
    await invModel.syncIndexes();
  }, 60_000);

  afterAll(async () => {
    await replSet.stop();
  }, 30_000);

  afterEach(async () => {
    await Promise.all([
      userModel.deleteMany({}),
      txModel.deleteMany({}),
      invModel.deleteMany({}),
    ]);
  });

  const createPremiumUser = async () => {
    const uid = new Types.ObjectId().toHexString();
    const doc = await userModel.create({
      email: `bp-${uid}@test.com`,
      passwordHash: 'hash',
      username: `bp_${uid}`,
      usernameNormalized: `bp_${uid}`,
      role: 'premium',
      coins: 0,
      gems: 0,
      blockedUsers: [],
    });
    return doc._id.toString();
  };

  it('credits coins and grants the premium cosmetic on claim', async () => {
    const userId = await createPremiumUser();

    // Tier 3: free = 200 coins, premium = cosmetic frame-prism.
    const result = await service.claim(userId, 3);
    expect(result.claimedTiers).toContain(3);

    // Destructure to satisfy the lint rule banning direct .coins/.gems access.
    const { coins } = await wallet.getBalance(userId);
    expect(coins).toBe(200);
    expect(await inventory.owns(userId, 'frame-prism')).toBe(true);
  });

  it('is idempotent — re-claiming does not double-credit or double-grant', async () => {
    const userId = await createPremiumUser();

    await service.claim(userId, 3);
    await service.claim(userId, 3); // repeat

    const { coins } = await wallet.getBalance(userId);
    expect(coins).toBe(200); // not 400

    const rows = await invModel.countDocuments({
      userId: new Types.ObjectId(userId),
      itemId: 'frame-prism',
    });
    expect(rows).toBe(1); // single grant
  });

  it('persists claimed tiers across calls', async () => {
    const userId = await createPremiumUser();
    await service.claim(userId, 1);
    await service.claim(userId, 2);
    const state = await service.getState(userId);
    expect(state.claimedTiers.sort()).toEqual([1, 2]);
  });
});
