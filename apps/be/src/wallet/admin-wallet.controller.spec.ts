import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { Types } from 'mongoose';
import { AdminWalletController } from './admin-wallet.controller';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { InsufficientFundsException } from './exceptions/insufficient-funds.exception';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

type ServerHandle = Parameters<typeof request>[0];

const TARGET_USER_ID = new Types.ObjectId().toString();

const makeTxView = (overrides: Record<string, unknown> = {}) => ({
  id: new Types.ObjectId().toString(),
  currency: 'coins',
  delta: 100,
  balanceAfter: 100,
  reason: 'admin_grant',
  metadata: {},
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('AdminWalletController (integration)', () => {
  let app: INestApplication<App>;
  const server = (): ServerHandle => app.getHttpServer();
  const walletService = {
    credit: jest.fn(),
    debit: jest.fn(),
    getBalance: jest.fn(),
    getHistory: jest.fn(),
  };
  let adminUserId = 'admin-id-not-real';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AdminWalletController],
      providers: [{ provide: WalletService, useValue: walletService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest<RequestWithUser>();
          req.user = {
            userId: adminUserId,
            email: 'admin@x',
            username: 'admin',
          };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    adminUserId = new Types.ObjectId().toString();
    walletService.credit.mockReset();
    walletService.debit.mockReset();
    walletService.getBalance.mockReset();
    walletService.getHistory.mockReset();
  });

  describe('GET /admin/wallet/users/:userId/balance', () => {
    it('returns the target user balance', async () => {
      walletService.getBalance.mockResolvedValue({ coins: 200, gems: 5 });

      const res = await request(server())
        .get(`/admin/wallet/users/${TARGET_USER_ID}/balance`)
        .expect(200);

      expect(res.body as unknown).toEqual({ coins: 200, gems: 5 });
      expect(walletService.getBalance).toHaveBeenCalledWith(TARGET_USER_ID);
    });
  });

  describe('GET /admin/wallet/users/:userId/transactions', () => {
    it('returns transaction history for target user', async () => {
      const mockHistory = { items: [], nextCursor: null };
      walletService.getHistory.mockResolvedValue(mockHistory);

      const res = await request(server())
        .get(`/admin/wallet/users/${TARGET_USER_ID}/transactions`)
        .expect(200);

      expect(res.body as unknown).toEqual(mockHistory);
      expect(walletService.getHistory).toHaveBeenCalledWith(TARGET_USER_ID, {});
    });
  });

  describe('POST /admin/wallet/users/:userId/grant', () => {
    it('calls walletService.credit with admin_grant reason, UUID key, and metadata', async () => {
      const txView = makeTxView({ reason: 'admin_grant' });
      walletService.credit.mockResolvedValue(txView);

      const res = await request(server())
        .post(`/admin/wallet/users/${TARGET_USER_ID}/grant`)
        .send({ currency: 'coins', amount: 100, note: 'bonus' })
        .expect(201);

      expect(res.body as unknown).toMatchObject({
        reason: 'admin_grant',
        delta: 100,
      });

      expect(walletService.credit).toHaveBeenCalledWith(
        TARGET_USER_ID,
        'coins',
        100,
        'admin_grant',
        expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        ),
        { adminUserId: adminUserId, note: 'bonus' },
      );
    });

    it('passes adminUserId in metadata', async () => {
      walletService.credit.mockResolvedValue(makeTxView());

      await request(server())
        .post(`/admin/wallet/users/${TARGET_USER_ID}/grant`)
        .send({ currency: 'gems', amount: 50 })
        .expect(201);

      const [, , , , , metadata] = walletService.credit.mock
        .calls[0] as unknown[];
      expect(metadata).toMatchObject({ adminUserId: adminUserId });
    });

    it('generates a different UUID key for each call', async () => {
      walletService.credit.mockResolvedValue(makeTxView());

      await request(server())
        .post(`/admin/wallet/users/${TARGET_USER_ID}/grant`)
        .send({ currency: 'coins', amount: 10 })
        .expect(201);

      await request(server())
        .post(`/admin/wallet/users/${TARGET_USER_ID}/grant`)
        .send({ currency: 'coins', amount: 10 })
        .expect(201);

      const calls = walletService.credit.mock.calls as unknown[][];
      const key1 = calls[0]?.[4] as string;
      const key2 = calls[1]?.[4] as string;
      expect(key1).not.toBe(key2);
    });

    it('returns 400 when currency is missing', async () => {
      await request(server())
        .post(`/admin/wallet/users/${TARGET_USER_ID}/grant`)
        .send({ amount: 100 })
        .expect(400);
    });

    it('returns 400 when currency is invalid', async () => {
      await request(server())
        .post(`/admin/wallet/users/${TARGET_USER_ID}/grant`)
        .send({ currency: 'tickets', amount: 100 })
        .expect(400);
    });

    it('returns 400 when amount is negative', async () => {
      await request(server())
        .post(`/admin/wallet/users/${TARGET_USER_ID}/grant`)
        .send({ currency: 'coins', amount: -50 })
        .expect(400);
    });

    it('returns 400 when amount is zero', async () => {
      await request(server())
        .post(`/admin/wallet/users/${TARGET_USER_ID}/grant`)
        .send({ currency: 'coins', amount: 0 })
        .expect(400);
    });

    it('returns 400 when amount is fractional', async () => {
      await request(server())
        .post(`/admin/wallet/users/${TARGET_USER_ID}/grant`)
        .send({ currency: 'coins', amount: 10.5 })
        .expect(400);
    });

    it('returns 400 when amount exceeds max', async () => {
      await request(server())
        .post(`/admin/wallet/users/${TARGET_USER_ID}/grant`)
        .send({ currency: 'coins', amount: 2_000_000 })
        .expect(400);
    });
  });

  describe('POST /admin/wallet/users/:userId/deduct', () => {
    it('calls walletService.debit with admin_deduct reason and metadata', async () => {
      const txView = makeTxView({ reason: 'admin_deduct', delta: -50 });
      walletService.debit.mockResolvedValue(txView);

      await request(server())
        .post(`/admin/wallet/users/${TARGET_USER_ID}/deduct`)
        .send({ currency: 'coins', amount: 50, note: 'penalty' })
        .expect(201);

      expect(walletService.debit).toHaveBeenCalledWith(
        TARGET_USER_ID,
        'coins',
        50,
        'admin_deduct',
        expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        ),
        { adminUserId: adminUserId, note: 'penalty' },
      );
    });

    it('returns 422 when service throws InsufficientFundsException', async () => {
      walletService.debit.mockRejectedValue(
        new InsufficientFundsException('coins', 100, 10),
      );

      await request(server())
        .post(`/admin/wallet/users/${TARGET_USER_ID}/deduct`)
        .send({ currency: 'coins', amount: 100 })
        .expect(422);
    });

    it('returns 400 when amount is negative', async () => {
      await request(server())
        .post(`/admin/wallet/users/${TARGET_USER_ID}/deduct`)
        .send({ currency: 'coins', amount: -10 })
        .expect(400);
    });

    it('returns 400 when currency is missing', async () => {
      await request(server())
        .post(`/admin/wallet/users/${TARGET_USER_ID}/deduct`)
        .send({ amount: 10 })
        .expect(400);
    });

    it('returns 400 when amount is fractional', async () => {
      await request(server())
        .post(`/admin/wallet/users/${TARGET_USER_ID}/deduct`)
        .send({ currency: 'gems', amount: 3.14 })
        .expect(400);
    });
  });
});
