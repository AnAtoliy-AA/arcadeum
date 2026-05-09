import { Test } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { Model, Types } from 'mongoose';
import { WalletService } from './wallet.service';
import { WalletModule } from './wallet.module';
import { InsufficientFundsException } from './exceptions/insufficient-funds.exception';
import { User } from '../auth/schemas/user.schema';
import {
  WalletTransaction,
  WalletTransactionDocument,
} from './schemas/wallet-transaction.schema';
import { AuthModule } from '../auth/auth.module';

describe('WalletService (integration)', () => {
  let replSet: MongoMemoryReplSet;
  let wallet: WalletService;
  let userModel: Model<User>;
  let txModel: Model<WalletTransactionDocument>;

  beforeAll(async () => {
    replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const uri = replSet.getUri();

    const moduleRef = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(uri), AuthModule, WalletModule],
    }).compile();

    wallet = moduleRef.get(WalletService);
    userModel = moduleRef.get<Model<User>>(getModelToken(User.name));
    txModel = moduleRef.get<Model<WalletTransactionDocument>>(
      getModelToken(WalletTransaction.name),
    );

    // Sync indexes so the unique idempotencyKey constraint is enforced.
    await txModel.syncIndexes();
  }, 60_000);

  afterAll(async () => {
    await replSet.stop();
  }, 30_000);

  afterEach(async () => {
    await userModel.deleteMany({});
    await txModel.deleteMany({});
  });

  const createUser = async (overrides: Partial<User> = {}) => {
    const uid = new Types.ObjectId().toHexString();
    return userModel.create({
      email: `user-${uid}@test.com`,
      passwordHash: 'hash',
      username: `user_${uid}`,
      usernameNormalized: `user_${uid}`,
      coins: 0,
      gems: 0,
      blockedUsers: [],
      ...overrides,
    });
  };

  describe('round-trip credit + debit + idempotency', () => {
    it('credits once for duplicate key, balance stays at 50', async () => {
      const u = await createUser();
      const id = u._id.toString();

      await wallet.credit(id, 'coins', 50, 'admin_grant', 'k1');
      // Same key — should be idempotent
      await wallet.credit(id, 'coins', 50, 'admin_grant', 'k1');

      const balance = await wallet.getBalance(id);
      expect(balance.coins).toBe(50);

      const txCount = await txModel.countDocuments({ userId: u._id });
      expect(txCount).toBe(1);
    });

    it('records separate transactions for different keys', async () => {
      const u = await createUser();
      const id = u._id.toString();

      await wallet.credit(id, 'coins', 30, 'admin_grant', 'key-a');
      await wallet.credit(id, 'coins', 20, 'admin_grant', 'key-b');

      const balance = await wallet.getBalance(id);
      expect(balance.coins).toBe(50);

      const txCount = await txModel.countDocuments({ userId: u._id });
      expect(txCount).toBe(2);
    });

    it('debits correctly and balance reaches 0', async () => {
      const u = await createUser({ coins: 100 });
      const id = u._id.toString();

      await wallet.debit(id, 'coins', 100, 'admin_deduct', 'debit-k1');

      const balance = await wallet.getBalance(id);
      expect(balance.coins).toBe(0);
    });
  });

  describe('insufficient funds', () => {
    it('throws InsufficientFundsException when debit > balance', async () => {
      const u = await createUser({ coins: 10 });
      const id = u._id.toString();

      await expect(
        wallet.debit(id, 'coins', 50, 'admin_deduct', 'over-k1'),
      ).rejects.toBeInstanceOf(InsufficientFundsException);
    });

    it('leaves balance unchanged after a failed debit', async () => {
      const u = await createUser({ coins: 10 });
      const id = u._id.toString();

      await expect(
        wallet.debit(id, 'coins', 50, 'admin_deduct', 'over-k2'),
      ).rejects.toBeInstanceOf(InsufficientFundsException);

      const balance = await wallet.getBalance(id);
      expect(balance.coins).toBe(10);

      const txCount = await txModel.countDocuments({ userId: u._id });
      expect(txCount).toBe(0);
    });
  });

  describe('concurrent debit race', () => {
    it('only one of two concurrent debits succeeds when balance = requested amount', async () => {
      const u = await createUser({ coins: 50 });
      const id = u._id.toString();

      const results = await Promise.allSettled([
        wallet.debit(id, 'coins', 50, 'admin_deduct', 'race-a'),
        wallet.debit(id, 'coins', 50, 'admin_deduct', 'race-b'),
      ]);

      const ok = results.filter((r) => r.status === 'fulfilled').length;
      const fail = results.filter((r) => r.status === 'rejected').length;

      expect(ok).toBe(1);
      expect(fail).toBe(1);

      const balance = await wallet.getBalance(id);
      expect(balance.coins).toBe(0);

      const txCount = await txModel.countDocuments({ userId: u._id });
      expect(txCount).toBe(1);
    });
  });
});
