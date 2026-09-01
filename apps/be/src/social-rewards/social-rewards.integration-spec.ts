import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConflictException } from '@nestjs/common';
import {
  getSharedMongoUri,
  closeTestDatabase,
} from '../../test/integration-helpers';
import { SocialRewardsService } from './social-rewards.service';
import { SocialRewardsModule } from './social-rewards.module';
import {
  SocialRewardClaim,
  SocialRewardClaimDocument,
} from './schemas/social-reward-claim.schema';
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

describe('SocialRewardsService (integration)', () => {
  let moduleRef: TestingModule;
  let service: SocialRewardsService;
  let wallet: WalletService;
  let userModel: Model<User>;
  let txModel: Model<WalletTransactionDocument>;
  let claimModel: Model<SocialRewardClaimDocument>;

  let userId: string;

  beforeAll(async () => {
    const uri = getSharedMongoUri();

    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(uri, { dbName: 'social-rewards-integration' }),
        AuthModule,
        WalletModule,
        EconomyModule,
        SocialRewardsModule,
      ],
    })
      .overrideProvider(WalletGateway)
      .useValue({ emitBalance: jest.fn() })
      .compile();

    service = moduleRef.get(SocialRewardsService);
    wallet = moduleRef.get(WalletService);
    userModel = moduleRef.get<Model<User>>(getModelToken(User.name));
    txModel = moduleRef.get<Model<WalletTransactionDocument>>(
      getModelToken(WalletTransaction.name),
    );
    claimModel = moduleRef.get<Model<SocialRewardClaimDocument>>(
      getModelToken(SocialRewardClaim.name),
    );

    await txModel.syncIndexes();
    await claimModel.syncIndexes();
  }, 60_000);

  afterAll(async () => {
    await closeTestDatabase(moduleRef);
  }, 30_000);

  beforeEach(async () => {
    await userModel.deleteMany({});
    await txModel.deleteMany({});
    await claimModel.deleteMany({});

    const created = await userModel.create({
      username: 'socialplayer',
      usernameNormalized: 'socialplayer',
      email: 'social@arcadeum.test',
      passwordHash: 'hashedpassword',
      coins: 0,
      gems: 0,
      blockedUsers: [],
    });
    userId = created._id.toHexString();
  });

  it('credits gems and creates claim row on first claim', async () => {
    const res = await service.claimReward(userId, 'discord');

    expect(res.success).toBe(true);
    expect(res.platform).toBe('discord');
    expect(res.gemsAwarded).toBe(1);
    expect(res.gemsBalanceAfter).toBe(1);

    const userBalance = await wallet.getBalance(userId);
    expect(userBalance['gems']).toBe(1);

    const claimDoc = await claimModel.findOne({
      userId: new Types.ObjectId(userId),
      platform: 'discord',
    });
    expect(claimDoc).toBeDefined();
    expect(claimDoc?.gemsAwarded).toBe(1);

    const history = await wallet.getHistory(userId, { limit: 5 });
    const tx = history.items.find((t) => t.reason === 'social_reward');
    expect(tx).toBeDefined();
    expect(tx?.delta).toBe(1);
  });

  it('rejects duplicate claim for the same platform', async () => {
    await service.claimReward(userId, 'telegram');

    await expect(service.claimReward(userId, 'telegram')).rejects.toThrow(
      ConflictException,
    );
  });

  it('allows claiming multiple distinct platforms', async () => {
    await service.claimReward(userId, 'discord');
    await service.claimReward(userId, 'telegram');

    const status = await service.getStatus(userId);
    expect(status.totalClaimed).toBe(2);

    const userBalance = await wallet.getBalance(userId);
    expect(userBalance['gems']).toBe(2);
  });
});
