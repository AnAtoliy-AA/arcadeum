/**
 * ReferralService integration tests — real Mongo replica set via
 * mongodb-memory-server. Mirrors wallet.service.integration-spec.ts.
 *
 * Tests cover: per-referral credit, tier-1 bonus at 3 referrals,
 * idempotency of tier bonus, duplicate referral guard.
 */
import { Test } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { Model, Types } from 'mongoose';
import { ReferralService } from './referral.service';
import { ReferralModule } from './referral.module';
import { WalletModule } from '../wallet/wallet.module';
import { WalletService } from '../wallet/wallet.service';
import { WalletGateway } from '../wallet/wallet.gateway';
import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/schemas/user.schema';
import { Referral } from './schemas/referral.schema';
import {
  WalletTransaction,
  WalletTransactionDocument,
} from '../wallet/schemas/wallet-transaction.schema';

describe('ReferralService (integration)', () => {
  let replSet: MongoMemoryReplSet;
  let service: ReferralService;
  let wallet: WalletService;
  let userModel: Model<User>;
  let referralModel: Model<Referral>;
  let txModel: Model<WalletTransactionDocument>;

  let referrerId: string;

  beforeAll(async () => {
    replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const uri = replSet.getUri();

    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        AuthModule,
        WalletModule,
        ReferralModule,
      ],
    })
      .overrideProvider(WalletGateway)
      .useValue({ emitBalance: jest.fn() })
      .compile();

    service = moduleRef.get(ReferralService);
    wallet = moduleRef.get(WalletService);
    userModel = moduleRef.get<Model<User>>(getModelToken(User.name));
    referralModel = moduleRef.get<Model<Referral>>(
      getModelToken(Referral.name),
    );
    txModel = moduleRef.get<Model<WalletTransactionDocument>>(
      getModelToken(WalletTransaction.name),
    );

    // Sync indexes so the idempotencyKey unique constraint is enforced.
    await txModel.syncIndexes();
  }, 60_000);

  afterAll(async () => {
    await replSet.stop();
  }, 30_000);

  // Helper to create a user with a given referral code.
  const createUser = async (referralCode?: string): Promise<string> => {
    const uid = new Types.ObjectId().toHexString();
    const u = await userModel.create({
      email: `u-${uid}@test.com`,
      passwordHash: 'hash',
      username: `u_${uid}`,
      usernameNormalized: `u_${uid}`,
      coins: 0,
      gems: 0,
      blockedUsers: [],
      ...(referralCode ? { referralCode } : {}),
    });
    return u._id.toHexString();
  };

  beforeEach(async () => {
    // Clean up state between tests and create a fresh referrer.
    await userModel.deleteMany({});
    await referralModel.deleteMany({});
    await txModel.deleteMany({});

    referrerId = await createUser('TESTCODE');
  });

  describe('single referral', () => {
    it('credits 50 coins to the referrer on the first successful referral', async () => {
      const referred1Id = await createUser();
      await service.trackReferral('TESTCODE', referred1Id);

      expect(await wallet.getBalance(referrerId)).toMatchObject({ coins: 50 });

      const history = await wallet.getHistory(referrerId, { limit: 10 });
      const bonusTx = history.items.find(
        (tx) => tx.reason === 'referral_bonus',
      );
      expect(bonusTx?.delta).toBe(50);
    });
  });

  describe('3 referrals → tier 1 bonus', () => {
    it('credits per-referral + tier 1 bonus when reaching 3 referrals', async () => {
      const referred1Id = await createUser();
      const referred2Id = await createUser();
      const referred3Id = await createUser();

      await service.trackReferral('TESTCODE', referred1Id);
      await service.trackReferral('TESTCODE', referred2Id);
      await service.trackReferral('TESTCODE', referred3Id);

      // 3 × 50 (per-referral) + 100 (tier 1) = 250
      expect(await wallet.getBalance(referrerId)).toMatchObject({ coins: 250 });

      const history = await wallet.getHistory(referrerId, { limit: 20 });
      const tierTxs = history.items.filter(
        (tx) => tx.reason === 'referral_tier_bonus',
      );
      expect(tierTxs).toHaveLength(1);
      expect(tierTxs[0].delta).toBe(100);
    });
  });

  describe('4th referral does not refire tier 1', () => {
    it('does not double-credit tier 1 on a subsequent referral past 3', async () => {
      const referred1Id = await createUser();
      const referred2Id = await createUser();
      const referred3Id = await createUser();
      const referred4Id = await createUser();

      await service.trackReferral('TESTCODE', referred1Id);
      await service.trackReferral('TESTCODE', referred2Id);
      await service.trackReferral('TESTCODE', referred3Id);
      // At this point: 250 coins (3×50 + 100 tier-1)

      await service.trackReferral('TESTCODE', referred4Id);
      // 250 + 50 = 300; no new tier-1 bonus

      expect(await wallet.getBalance(referrerId)).toMatchObject({ coins: 300 });

      const history = await wallet.getHistory(referrerId, { limit: 20 });
      const tierTxs = history.items.filter(
        (tx) => tx.reason === 'referral_tier_bonus',
      );
      expect(tierTxs).toHaveLength(1); // still just the one
    });
  });

  describe('duplicate referral', () => {
    it('does not credit when the same referred user signs up again', async () => {
      const referred1Id = await createUser();

      await service.trackReferral('TESTCODE', referred1Id);
      await service.trackReferral('TESTCODE', referred1Id); // duplicate — silently ignored

      expect(await wallet.getBalance(referrerId)).toMatchObject({ coins: 50 });
    });
  });
});
