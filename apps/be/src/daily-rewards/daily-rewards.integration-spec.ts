/**
 * DailyRewardsService integration tests — real Mongo replica set via
 * mongodb-memory-server. Mirrors referral.service.integration-spec.ts.
 *
 * Coverage:
 *  - First-ever claim awards Day 1, writes ledger row, bumps user balance,
 *    and creates the per-user state doc.
 *  - Second claim same UTC day throws DailyRewardAlreadyClaimedError.
 */
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { Model, Types } from 'mongoose';
import { DailyRewardsService } from './daily-rewards.service';
import { DailyRewardAlreadyClaimedError } from './daily-rewards.errors';
import { DailyRewardsModule } from './daily-rewards.module';
import {
  UserDailyReward,
  UserDailyRewardDocument,
} from './schemas/user-daily-reward.schema';
import { WalletModule } from '../wallet/wallet.module';
import { WalletService } from '../wallet/wallet.service';
import { WalletGateway } from '../wallet/wallet.gateway';
import { AuthModule } from '../auth/auth.module';
import { EconomyModule } from '../economy/economy.module';
import { User } from '../auth/schemas/user.schema';
import {
  WalletTransaction,
  WalletTransactionDocument,
} from '../wallet/schemas/wallet-transaction.schema';
import { todayUtc } from './streak';

describe('DailyRewardsService (integration)', () => {
  let replSet: MongoMemoryReplSet;
  let service: DailyRewardsService;
  let wallet: WalletService;
  let userModel: Model<User>;
  let txModel: Model<WalletTransactionDocument>;
  let dailyModel: Model<UserDailyRewardDocument>;

  let userId: string;

  beforeAll(async () => {
    replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const uri = replSet.getUri();

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(uri),
        AuthModule,
        WalletModule,
        EconomyModule,
        DailyRewardsModule,
      ],
    })
      .overrideProvider(WalletGateway)
      .useValue({ emitBalance: jest.fn() })
      .compile();

    service = moduleRef.get(DailyRewardsService);
    wallet = moduleRef.get(WalletService);
    userModel = moduleRef.get<Model<User>>(getModelToken(User.name));
    txModel = moduleRef.get<Model<WalletTransactionDocument>>(
      getModelToken(WalletTransaction.name),
    );
    dailyModel = moduleRef.get<Model<UserDailyRewardDocument>>(
      getModelToken(UserDailyReward.name),
    );

    // Sync indexes so the wallet idempotencyKey unique constraint and the
    // userId unique constraint on user_daily_rewards are enforced.
    await txModel.syncIndexes();
    await dailyModel.syncIndexes();
  }, 60_000);

  afterAll(async () => {
    await replSet.stop();
  }, 30_000);

  beforeEach(async () => {
    await userModel.deleteMany({});
    await txModel.deleteMany({});
    await dailyModel.deleteMany({});

    const u = await userModel.create({
      email: 'daily@test.com',
      passwordHash: 'hash',
      username: 'daily_user',
      usernameNormalized: 'daily_user',
      coins: 0,
      gems: 0,
      blockedUsers: [],
    });
    userId = u._id.toHexString();
  });

  it('first claim credits Day 1 coins, writes ledger, persists state', async () => {
    const result = await service.claim(userId);

    expect(result.awardedCoins).toBe(10); // daily_reward_day_1 default
    expect(result.awardedGems).toBe(0);
    expect(result.currentStreak).toBe(1);
    expect(result.coinsBalanceAfter).toBe(10);
    expect(result.gemsBalanceAfter).toBeNull();

    // Wallet balance bumped
    expect(await wallet.getBalance(userId)).toMatchObject({ coins: 10 });

    // Ledger row with the right reason
    const history = await wallet.getHistory(userId, { limit: 5 });
    const tx = history.items.find((t) => t.reason === 'daily_reward');
    expect(tx).toBeDefined();
    expect(tx?.delta).toBe(10);

    // Per-user doc persisted
    const today = todayUtc(new Date());
    const stateDoc = await dailyModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean();
    expect(stateDoc).not.toBeNull();
    expect(stateDoc?.lastClaimedDay).toBe(today);
    expect(stateDoc?.currentStreak).toBe(1);
  });

  it('second claim same UTC day throws DailyRewardAlreadyClaimedError', async () => {
    await service.claim(userId);

    await expect(service.claim(userId)).rejects.toBeInstanceOf(
      DailyRewardAlreadyClaimedError,
    );

    // Balance unchanged after the failed second claim
    expect(await wallet.getBalance(userId)).toMatchObject({ coins: 10 });

    // Still exactly one daily_reward ledger row
    const history = await wallet.getHistory(userId, { limit: 5 });
    const dailyTxs = history.items.filter((t) => t.reason === 'daily_reward');
    expect(dailyTxs).toHaveLength(1);
  });

  it('getStatus reflects the persisted state after a claim', async () => {
    await service.claim(userId);

    const status = await service.getStatus(userId);
    expect(status.canClaim).toBe(false);
    expect(status.currentStreak).toBe(1);
  });
});
