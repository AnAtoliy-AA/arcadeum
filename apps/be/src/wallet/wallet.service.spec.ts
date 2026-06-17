// wallet.service.spec.ts
import { Test } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { ClientSession, Types } from 'mongoose';
import { WalletService } from './wallet.service';
import { WalletGateway } from './wallet.gateway';
import { User } from '../auth/schemas/user.schema';
import { WalletTransaction } from './schemas/wallet-transaction.schema';

type TransactionCallback = () => Promise<void>;

function makeTxDoc(overrides: {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  currency: string;
  delta: number;
  balanceAfter: number;
  reason: string;
  idempotencyKey: string;
  createdAt: Date;
}) {
  return {
    ...overrides,
    toObject() {
      return { ...overrides };
    },
  };
}

describe('WalletService', () => {
  const userId = new Types.ObjectId().toHexString();

  let service: WalletService;
  let userModel: { findOneAndUpdate: jest.Mock; findById: jest.Mock };
  let txModel: { create: jest.Mock; findOne: jest.Mock; find: jest.Mock };
  let connection: {
    startSession: jest.Mock;
  };
  let session: {
    withTransaction: jest.Mock;
    endSession: jest.Mock;
  };
  let walletGateway: { emitBalance: jest.Mock };

  beforeEach(async () => {
    userModel = {
      findOneAndUpdate: jest.fn(),
      findById: jest.fn(),
    };
    txModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };
    session = {
      withTransaction: jest.fn((cb: TransactionCallback) => cb()),
      endSession: jest.fn(),
    };
    connection = {
      startSession: jest.fn().mockResolvedValue(session),
    };
    walletGateway = {
      emitBalance: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: getConnectionToken(), useValue: connection },
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(WalletTransaction.name), useValue: txModel },
        { provide: WalletGateway, useValue: walletGateway },
      ],
    }).compile();

    service = moduleRef.get(WalletService);
  });

  describe('credit', () => {
    it('increments balance and writes a ledger row', async () => {
      userModel.findOneAndUpdate.mockResolvedValue({ coins: 100, gems: 0 });
      txModel.create.mockResolvedValue([
        makeTxDoc({
          _id: new Types.ObjectId(),
          userId: new Types.ObjectId(userId),
          currency: 'coins',
          delta: 100,
          balanceAfter: 100,
          reason: 'admin_grant',
          idempotencyKey: 'k1',
          createdAt: new Date('2026-05-09T00:00:00Z'),
        }),
      ]);

      const result = await service.credit(
        userId,
        'coins',
        100,
        'admin_grant',
        'k1',
        { adminUserId: 'admin-1' },
      );

      expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(Types.ObjectId) as unknown },
        { $inc: { coins: 100 } },
        expect.objectContaining({ new: true }) as unknown,
      );
      expect(txModel.create).toHaveBeenCalled();
      expect(result.delta).toBe(100);
      expect(result.balanceAfter).toBe(100);
      expect(walletGateway.emitBalance).toHaveBeenCalledWith(
        userId,
        expect.any(Object),
      );
    });

    it('rejects zero amount', async () => {
      await expect(
        service.credit(userId, 'coins', 0, 'admin_grant', 'k', undefined),
      ).rejects.toThrow();
    });

    it('rejects fractional amount', async () => {
      await expect(
        service.credit(userId, 'coins', 1.5, 'admin_grant', 'k', undefined),
      ).rejects.toThrow();
    });

    it('rejects unknown currency', async () => {
      await expect(
        service.credit(
          userId,
          'tickets' as never,
          10,
          'admin_grant',
          'k',
          undefined,
        ),
      ).rejects.toThrow();
    });
  });

  describe('debit', () => {
    it('decrements balance and writes a ledger row', async () => {
      userModel.findOneAndUpdate.mockResolvedValue({ coins: 50, gems: 0 });
      txModel.create.mockResolvedValue([
        makeTxDoc({
          _id: new Types.ObjectId(),
          userId: new Types.ObjectId(userId),
          currency: 'coins',
          delta: -50,
          balanceAfter: 50,
          reason: 'admin_deduct',
          idempotencyKey: 'k2',
          createdAt: new Date('2026-05-09T00:00:00Z'),
        }),
      ]);

      const result = await service.debit(
        userId,
        'coins',
        50,
        'admin_deduct',
        'k2',
      );

      expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(Types.ObjectId) as unknown, coins: { $gte: 50 } },
        { $inc: { coins: -50 } },
        expect.objectContaining({ new: true }) as unknown,
      );
      expect(result.delta).toBe(-50);
      expect(walletGateway.emitBalance).toHaveBeenCalledWith(
        userId,
        expect.any(Object),
      );
    });

    it('throws InsufficientFundsException when balance < amount', async () => {
      userModel.findOneAndUpdate.mockResolvedValue(null);
      userModel.findById.mockReturnValue({
        lean: () => Promise.resolve({ coins: 10, gems: 0 }),
      });

      await expect(
        service.debit(userId, 'coins', 50, 'admin_deduct', 'k3'),
      ).rejects.toThrow(/insufficientFunds/);
      expect(txModel.create).not.toHaveBeenCalled();
    });
  });

  describe('getBalance', () => {
    it('returns the user coins/gems', async () => {
      userModel.findById.mockReturnValue({
        lean: () => Promise.resolve({ coins: 42, gems: 3 }),
      });
      const r = await service.getBalance(userId);
      expect(r).toEqual({ coins: 42, gems: 3, arcadeum: 0 });
    });
  });

  describe('getHistory', () => {
    it('paginates by createdAt + _id and respects currency filter', async () => {
      const itemId = new Types.ObjectId();
      const histItem = makeTxDoc({
        _id: itemId,
        userId: new Types.ObjectId(userId),
        currency: 'coins',
        delta: 5,
        balanceAfter: 5,
        reason: 'admin_grant',
        idempotencyKey: 'a',
        createdAt: new Date('2026-05-09T01:00:00Z'),
      });
      txModel.find.mockReturnValue({
        sort: () => ({
          limit: () => ({ lean: () => Promise.resolve([histItem]) }),
        }),
      });
      const r = await service.getHistory(userId, {
        currency: 'coins',
        limit: 1,
      });
      expect(r.items).toHaveLength(1);
      expect(r.nextCursor).toBe(null);
    });

    it('passes currency filter to find()', async () => {
      const find = jest.fn().mockReturnValue({
        sort: () => ({ limit: () => ({ lean: () => Promise.resolve([]) }) }),
      });
      txModel.find = find;
      await service.getHistory(userId, { currency: 'gems', limit: 5 });
      const calls = find.mock.calls as unknown[][];
      const filter = calls[0][0] as Record<string, unknown>;
      expect(filter.currency).toBe('gems');
      expect(filter.userId).toBeInstanceOf(Types.ObjectId);
    });

    it('emits a non-null nextCursor when the page is full and round-trips it back', async () => {
      const lastId = new Types.ObjectId();
      const lastCreatedAt = new Date('2026-05-09T01:00:00Z');
      const olderId = new Types.ObjectId();
      const items = [
        makeTxDoc({
          _id: lastId,
          userId: new Types.ObjectId(userId),
          currency: 'coins',
          delta: 5,
          balanceAfter: 5,
          reason: 'admin_grant',
          idempotencyKey: 'a',
          createdAt: lastCreatedAt,
        }),
        makeTxDoc({
          _id: olderId,
          userId: new Types.ObjectId(userId),
          currency: 'coins',
          delta: 1,
          balanceAfter: 4,
          reason: 'admin_grant',
          idempotencyKey: 'b',
          createdAt: new Date('2026-05-09T00:30:00Z'),
        }),
        // 3rd item: triggers hasMore (limit + 1).
        makeTxDoc({
          _id: new Types.ObjectId(),
          userId: new Types.ObjectId(userId),
          currency: 'coins',
          delta: 1,
          balanceAfter: 3,
          reason: 'admin_grant',
          idempotencyKey: 'c',
          createdAt: new Date('2026-05-09T00:00:00Z'),
        }),
      ];
      const find = jest.fn().mockReturnValue({
        sort: () => ({ limit: () => ({ lean: () => Promise.resolve(items) }) }),
      });
      txModel.find = find;

      const first = await service.getHistory(userId, { limit: 2 });

      expect(first.items).toHaveLength(2);
      expect(first.nextCursor).not.toBe(null);

      // Hand the cursor back in; the service should decode it and add an
      // (createdAt < X) OR (createdAt = X AND _id < Y) filter clause.
      find.mockReturnValueOnce({
        sort: () => ({ limit: () => ({ lean: () => Promise.resolve([]) }) }),
      });
      await service.getHistory(userId, {
        cursor: first.nextCursor as string,
        limit: 2,
      });
      const secondCalls = find.mock.calls as unknown[][];
      const secondFilter = secondCalls[1][0] as {
        $or?: { createdAt: unknown; _id?: unknown }[];
      };
      expect(Array.isArray(secondFilter.$or)).toBe(true);
      expect(secondFilter.$or).toHaveLength(2);
      // Tie-break clause must include _id.
      expect(secondFilter.$or?.[1]._id).toBeDefined();
    });
  });

  describe('idempotency', () => {
    it('returns the prior transaction when the key is reused', async () => {
      const priorId = new Types.ObjectId();
      session.withTransaction.mockImplementationOnce(() => {
        const err = new Error('dup') as Error & {
          code: number;
          keyPattern: Record<string, number>;
        };
        err.code = 11000;
        err.keyPattern = { idempotencyKey: 1 };
        return Promise.reject(err);
      });
      txModel.findOne.mockResolvedValue(
        makeTxDoc({
          _id: priorId,
          userId: new Types.ObjectId(userId),
          currency: 'coins',
          delta: 100,
          balanceAfter: 100,
          reason: 'admin_grant',
          idempotencyKey: 'k-dup',
          createdAt: new Date('2026-05-09T00:00:00Z'),
        }),
      );

      const result = await service.credit(
        userId,
        'coins',
        100,
        'admin_grant',
        'k-dup',
      );

      expect(result.id).toBe(String(priorId));
      expect(txModel.create).not.toHaveBeenCalled();
    });
  });

  describe('credit (parentSession)', () => {
    it('uses the caller-supplied session and skips its own transaction', async () => {
      const externalSession = {} as ClientSession;
      userModel.findOneAndUpdate.mockResolvedValue({ coins: 100, gems: 0 });
      txModel.create.mockResolvedValue([
        makeTxDoc({
          _id: new Types.ObjectId(),
          userId: new Types.ObjectId(userId),
          currency: 'coins',
          delta: 100,
          balanceAfter: 100,
          reason: 'admin_grant',
          idempotencyKey: 'k-parent',
          createdAt: new Date('2026-05-09T00:00:00Z'),
        }),
      ]);

      await service.credit(
        userId,
        'coins',
        100,
        'admin_grant',
        'k-parent',
        undefined,
        externalSession,
      );

      // No own startSession call.
      expect(connection.startSession).not.toHaveBeenCalled();
      // findOneAndUpdate was called with the external session.
      expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.any(Object) as unknown,
        expect.any(Object) as unknown,
        expect.objectContaining({ session: externalSession }) as unknown,
      );
      // The gateway emit is deferred (not called inline).
      expect(walletGateway.emitBalance).not.toHaveBeenCalled();
    });

    it('re-throws duplicate key error to abort the caller transaction', async () => {
      const externalSession = {} as ClientSession;
      const dupErr = new Error('dup') as Error & {
        code: number;
        keyPattern: Record<string, number>;
      };
      dupErr.code = 11000;
      dupErr.keyPattern = { idempotencyKey: 1 };

      userModel.findOneAndUpdate.mockResolvedValue({ coins: 100, gems: 0 });
      txModel.create.mockRejectedValue(dupErr);

      await expect(
        service.credit(
          userId,
          'coins',
          100,
          'admin_grant',
          'k-parent-dup',
          undefined,
          externalSession,
        ),
      ).rejects.toMatchObject({ code: 11000 });

      // Should NOT call findOne to recover — caller is responsible.
      expect(txModel.findOne).not.toHaveBeenCalled();
    });
  });

  describe('debit (parentSession)', () => {
    it('uses the caller-supplied session and skips its own transaction', async () => {
      const externalSession = {} as ClientSession;
      userModel.findOneAndUpdate.mockResolvedValue({ coins: 50, gems: 0 });
      txModel.create.mockResolvedValue([
        makeTxDoc({
          _id: new Types.ObjectId(),
          userId: new Types.ObjectId(userId),
          currency: 'coins',
          delta: -50,
          balanceAfter: 50,
          reason: 'admin_deduct',
          idempotencyKey: 'k-debit-parent',
          createdAt: new Date('2026-05-09T00:00:00Z'),
        }),
      ]);

      await service.debit(
        userId,
        'coins',
        50,
        'admin_deduct',
        'k-debit-parent',
        undefined,
        externalSession,
      );

      // No own startSession call.
      expect(connection.startSession).not.toHaveBeenCalled();
      // findOneAndUpdate was called with the external session.
      expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ coins: { $gte: 50 } }) as unknown,
        expect.any(Object) as unknown,
        expect.objectContaining({ session: externalSession }) as unknown,
      );
      // The gateway emit is deferred (not called inline).
      expect(walletGateway.emitBalance).not.toHaveBeenCalled();
    });
  });

  describe('findByIdempotencyKey', () => {
    it('returns the transaction view when found', async () => {
      const txId = new Types.ObjectId();
      txModel.findOne.mockResolvedValue(
        makeTxDoc({
          _id: txId,
          userId: new Types.ObjectId(userId),
          currency: 'coins',
          delta: 100,
          balanceAfter: 100,
          reason: 'admin_grant',
          idempotencyKey: 'find-key',
          createdAt: new Date('2026-05-09T00:00:00Z'),
        }),
      );

      const result = await service.findByIdempotencyKey('find-key');

      expect(result).not.toBeNull();
      expect(result?.id).toBe(String(txId));
      expect(txModel.findOne).toHaveBeenCalledWith({
        idempotencyKey: 'find-key',
      });
    });

    it('returns null when not found', async () => {
      txModel.findOne.mockResolvedValue(null);
      const result = await service.findByIdempotencyKey('missing-key');
      expect(result).toBeNull();
    });
  });
});
