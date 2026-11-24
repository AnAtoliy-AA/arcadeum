import { Test } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { WalletService } from './wallet.service';
import { WalletGateway } from './wallet.gateway';
import { User } from '../auth/schemas/user.schema';
import { WalletTransaction } from './schemas/wallet-transaction.schema';

type TransactionCallback = () => Promise<void>;

describe('WalletService balance push', () => {
  const userId = new Types.ObjectId().toHexString();
  let service: WalletService;
  let userModel: { findOneAndUpdate: jest.Mock };
  let txModel: { create: jest.Mock };
  let session: { withTransaction: jest.Mock; endSession: jest.Mock };
  let gateway: { emitBalance: jest.Mock };

  beforeEach(async () => {
    userModel = {
      findOneAndUpdate: jest
        .fn()
        .mockResolvedValue({ coins: 100, gems: 0, arcadeum: 0 }),
    };
    const created = {
      _id: new Types.ObjectId(),
      currency: 'coins',
      delta: 100,
      balanceAfter: 100,
      reason: 'admin_grant',
      createdAt: new Date('2026-05-09T00:00:00Z'),
    };
    txModel = {
      create: jest
        .fn()
        .mockResolvedValue([{ ...created, toObject: () => created }]),
    };
    session = {
      withTransaction: jest.fn((cb: TransactionCallback) => cb()),
      endSession: jest.fn(),
    };
    gateway = { emitBalance: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getConnectionToken(),
          useValue: { startSession: jest.fn().mockResolvedValue(session) },
        },
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(WalletTransaction.name), useValue: txModel },
        { provide: WalletGateway, useValue: gateway },
      ],
    }).compile();
    service = moduleRef.get(WalletService);
  });

  it('emits only after the own transaction has committed', async () => {
    const order: string[] = [];
    session.withTransaction.mockImplementation(
      async (cb: TransactionCallback) => {
        await cb();
        order.push('commit');
      },
    );
    gateway.emitBalance.mockImplementation(() => {
      order.push('emit');
    });

    await service.credit(userId, 'coins', 100, 'admin_grant', 'k-order');

    expect(order).toEqual(['commit', 'emit']);
  });

  it('does not fail a committed credit when the gateway emit throws', async () => {
    gateway.emitBalance.mockImplementation(() => {
      throw new Error('server not ready');
    });

    await expect(
      service.credit(userId, 'coins', 100, 'admin_grant', 'k-emit'),
    ).resolves.toMatchObject({ delta: 100 });
  });

  it('does not emit when the transaction aborts', async () => {
    session.withTransaction.mockRejectedValue(new Error('abort'));

    await expect(
      service.credit(userId, 'coins', 100, 'admin_grant', 'k-abort'),
    ).rejects.toThrow('abort');

    expect(gateway.emitBalance).not.toHaveBeenCalled();
  });
});
