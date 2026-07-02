/**
 * TournamentsService integration tests — real Mongo replica set via
 * mongodb-memory-server. Mirrors wallet.service.integration-spec.ts.
 *
 * Tests cover: register-with-fee, insufficient-balance, unregister-refund,
 * cancel-refund-all, markComplete-prize, markComplete-idempotency.
 */
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { HydratedDocument, Model, Types } from 'mongoose';
import { TournamentsService } from './tournaments.service';
import { TournamentsModule } from './tournaments.module';
import { WalletModule } from '../wallet/wallet.module';
import { WalletService } from '../wallet/wallet.service';
import { WalletGateway } from '../wallet/wallet.gateway';
import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/schemas/user.schema';
import {
  Tournament,
  TournamentDocument,
  type TournamentStatus,
} from './schemas/tournament.schema';
import {
  WalletTransaction,
  WalletTransactionDocument,
} from '../wallet/schemas/wallet-transaction.schema';
import { createTestUser, resetTestUsers } from '../../test/integration-helpers';

describe('TournamentsService (integration)', () => {
  let replSet: MongoMemoryReplSet;
  let tournaments: TournamentsService;
  let wallet: WalletService;
  let userModel: Model<User>;
  let tournamentModel: Model<TournamentDocument>;
  let txModel: Model<WalletTransactionDocument>;

  beforeAll(async () => {
    replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const uri = replSet.getUri();

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(uri),
        AuthModule,
        WalletModule,
        TournamentsModule,
      ],
    })
      .overrideProvider(WalletGateway)
      .useValue({ emitBalance: jest.fn() })
      .compile();

    tournaments = moduleRef.get(TournamentsService);
    wallet = moduleRef.get(WalletService);
    userModel = moduleRef.get<Model<User>>(getModelToken(User.name));
    tournamentModel = moduleRef.get<Model<TournamentDocument>>(
      getModelToken(Tournament.name),
    );
    txModel = moduleRef.get<Model<WalletTransactionDocument>>(
      getModelToken(WalletTransaction.name),
    );

    // Sync indexes so idempotencyKey unique constraint is enforced.
    await txModel.syncIndexes();
  }, 60_000);

  afterAll(async () => {
    await replSet.stop();
  }, 30_000);

  afterEach(async () => {
    await userModel.deleteMany({});
    await tournamentModel.deleteMany({});
    await txModel.deleteMany({});
    resetTestUsers();
  });

  // ── Helpers ──────────────────────────────────────────────────────────────

  const createUser = async (initialCoins = 0): Promise<string> => {
    const { id } = await createTestUser(userModel, { coins: initialCoins });
    return id;
  };

  const createTournament = async (overrides: {
    status?: TournamentStatus;
    entryFeeCoins?: number;
    prizePoolCoins?: number;
    maxPlayers?: number;
  }): Promise<string> => {
    const adminId = new Types.ObjectId();
    const doc = (await tournamentModel.create({
      status: overrides.status ?? 'registration_open',
      gameType: 'critical_v1',
      scheduledAt: new Date('2026-06-01T18:00:00Z'),
      registrationOpensAt: new Date('2026-05-01T00:00:00Z'),
      registrationClosesAt: new Date('2026-06-01T17:00:00Z'),
      maxPlayers: overrides.maxPlayers ?? 16,
      entryFeeCoins: overrides.entryFeeCoins ?? 0,
      prizePoolCoins: overrides.prizePoolCoins ?? 0,
      winnerUserId: null,
      content: { en: { name: 'Test Cup' } },
      registrations: [],
      createdBy: adminId,
    })) as HydratedDocument<Tournament>;
    return doc._id.toHexString();
  };

  /** Assert coin balance via WalletService (avoids direct .coins access in this module). */
  const expectCoins = async (userId: string, expected: number) => {
    const bal = await wallet.getBalance(userId);
    expect(bal).toMatchObject({ coins: expected });
  };

  // ── Tests ─────────────────────────────────────────────────────────────────

  describe('register with entry fee', () => {
    it('debits wallet and inserts registration atomically', async () => {
      const userId = await createUser();
      await wallet.credit(
        userId,
        'coins',
        100,
        'admin_grant',
        `seed-${userId}`,
      );
      const tournamentId = await createTournament({ entryFeeCoins: 30 });

      await tournaments.register(tournamentId, userId, 'TestUser');

      await expectCoins(userId, 70);

      const t = await tournamentModel.findById(tournamentId).lean();
      expect(t!.registrations.some((r) => r.userId.toString() === userId)).toBe(
        true,
      );

      const txCount = await txModel.countDocuments({
        userId: new Types.ObjectId(userId),
        reason: 'tournament_entry',
      });
      expect(txCount).toBe(1);
    });

    it('leaves balance and registrations unchanged on insufficient balance', async () => {
      const userId = await createUser();
      await wallet.credit(userId, 'coins', 50, 'admin_grant', `seed-${userId}`);
      const tournamentId = await createTournament({ entryFeeCoins: 200 });

      await expect(
        tournaments.register(tournamentId, userId, null),
      ).rejects.toThrow();

      await expectCoins(userId, 50);

      const t = await tournamentModel.findById(tournamentId).lean();
      expect(t!.registrations).toHaveLength(0);

      const txCount = await txModel.countDocuments({
        userId: new Types.ObjectId(userId),
      });
      // Only the admin_grant seed tx
      expect(txCount).toBe(1);
    });

    it('is idempotent: second register call with same user returns without double-debiting', async () => {
      const userId = await createUser();
      await wallet.credit(
        userId,
        'coins',
        100,
        'admin_grant',
        `seed-${userId}`,
      );
      const tournamentId = await createTournament({ entryFeeCoins: 30 });

      // First register
      await tournaments.register(tournamentId, userId, null);
      // Second register (already registered — idempotent path via early return)
      await tournaments.register(tournamentId, userId, null);

      await expectCoins(userId, 70); // debited only once

      const entryTxCount = await txModel.countDocuments({
        userId: new Types.ObjectId(userId),
        reason: 'tournament_entry',
      });
      expect(entryTxCount).toBe(1);
    });
  });

  describe('unregister with refund', () => {
    it('refunds entry fee and removes registration, ledger has both rows', async () => {
      const userId = await createUser();
      await wallet.credit(
        userId,
        'coins',
        100,
        'admin_grant',
        `seed-${userId}`,
      );
      const tournamentId = await createTournament({ entryFeeCoins: 30 });

      await tournaments.register(tournamentId, userId, null);
      await tournaments.unregister(tournamentId, userId);

      await expectCoins(userId, 100); // back to start

      const t = await tournamentModel.findById(tournamentId).lean();
      expect(t!.registrations).toHaveLength(0);

      const history = await wallet.getHistory(userId, { limit: 10 });
      const reasons = history.items.map((tx) => tx.reason).sort();
      expect(reasons).toContain('tournament_entry');
      expect(reasons).toContain('tournament_refund');
    });
  });

  describe('cancel tournament refunds all paid participants', () => {
    it('refunds every paid registration on admin cancel', async () => {
      const u1 = await createUser();
      const u2 = await createUser();
      await wallet.credit(u1, 'coins', 100, 'admin_grant', `seed-${u1}`);
      await wallet.credit(u2, 'coins', 100, 'admin_grant', `seed-${u2}`);
      const tournamentId = await createTournament({ entryFeeCoins: 40 });

      await tournaments.register(tournamentId, u1, null);
      await tournaments.register(tournamentId, u2, null);

      // Transition to cancelled — should refund both
      await tournaments.transition(tournamentId, 'cancelled');

      await expectCoins(u1, 100);
      await expectCoins(u2, 100);

      const refundCount = await txModel.countDocuments({
        reason: 'tournament_refund',
      });
      expect(refundCount).toBe(2);
    });

    it('does not double-refund a user who already unregistered', async () => {
      const userId = await createUser();
      await wallet.credit(
        userId,
        'coins',
        100,
        'admin_grant',
        `seed-${userId}`,
      );
      const tournamentId = await createTournament({ entryFeeCoins: 40 });

      await tournaments.register(tournamentId, userId, null);
      // User self-unregisters — already refunded
      await tournaments.unregister(tournamentId, userId);

      // Admin cancels — the idempotency key matches self-unregister key
      await tournaments.transition(tournamentId, 'cancelled');

      await expectCoins(userId, 100); // still 100, not 140

      const refundCount = await txModel.countDocuments({
        userId: new Types.ObjectId(userId),
        reason: 'tournament_refund',
      });
      // Only 1 refund despite 2 attempts (self-unregister + cancel)
      expect(refundCount).toBe(1);
    });
  });

  describe('markComplete pays prize to winner', () => {
    it('credits prize pool to winner', async () => {
      const winnerId = await createUser();
      await wallet.credit(
        winnerId,
        'coins',
        10,
        'admin_grant',
        `seed-${winnerId}`,
      );
      const tournamentId = await createTournament({
        status: 'registration_open',
        prizePoolCoins: 500,
      });

      // Register and advance to live
      await tournaments.register(tournamentId, winnerId, null);
      await tournaments.transition(tournamentId, 'live');

      await tournaments.markComplete(tournamentId, winnerId);

      await expectCoins(winnerId, 510); // 10 seed + 500 prize

      const prizeTx = await txModel.findOne({
        userId: new Types.ObjectId(winnerId),
        reason: 'tournament_prize',
      });
      expect(prizeTx).not.toBeNull();
      expect(prizeTx!.delta).toBe(500);
    });

    it('is idempotent: second markComplete with same winner does not double-pay', async () => {
      const winnerId = await createUser();
      const tournamentId = await createTournament({
        status: 'registration_open',
        prizePoolCoins: 500,
      });

      await tournaments.register(tournamentId, winnerId, null);
      await tournaments.transition(tournamentId, 'live');

      await tournaments.markComplete(tournamentId, winnerId);
      // Second call: tournament is now 'completed' + same winner → idempotent no-op
      await tournaments.markComplete(tournamentId, winnerId);

      const txCount = await txModel.countDocuments({
        userId: new Types.ObjectId(winnerId),
        reason: 'tournament_prize',
      });
      expect(txCount).toBe(1); // only one prize row
    });
  });
});
