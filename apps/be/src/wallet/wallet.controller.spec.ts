import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { Types } from 'mongoose';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

type ServerHandle = Parameters<typeof request>[0];

describe('WalletController (integration)', () => {
  let app: INestApplication<App>;
  const server = (): ServerHandle => app.getHttpServer();
  const walletService = {
    getBalance: jest.fn(),
    getHistory: jest.fn(),
  };
  let requesterUserId = 'requester-id-not-real';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [{ provide: WalletService, useValue: walletService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest<RequestWithUser>();
          req.user = {
            userId: requesterUserId,
            email: 'me@x',
            username: 'me',
          };
          return true;
        },
      })
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
    requesterUserId = new Types.ObjectId().toString();
    walletService.getBalance.mockReset();
    walletService.getHistory.mockReset();
  });

  describe('GET /wallet/balance', () => {
    it('returns the user balance and calls service with correct userId', async () => {
      walletService.getBalance.mockResolvedValue({ coins: 25, gems: 0 });

      const res = await request(server()).get('/wallet/balance').expect(200);

      expect(res.body as unknown).toEqual({ coins: 25, gems: 0 });
      expect(walletService.getBalance).toHaveBeenCalledWith(requesterUserId);
    });

    it('returns gems balance correctly', async () => {
      walletService.getBalance.mockResolvedValue({ coins: 0, gems: 10 });

      const res = await request(server()).get('/wallet/balance').expect(200);

      expect(res.body as unknown).toEqual({ coins: 0, gems: 10 });
    });
  });

  describe('GET /wallet/transactions', () => {
    it('returns transaction history', async () => {
      const mockHistory = { items: [], nextCursor: null };
      walletService.getHistory.mockResolvedValue(mockHistory);

      const res = await request(server())
        .get('/wallet/transactions')
        .expect(200);

      expect(res.body as unknown).toEqual(mockHistory);
      expect(walletService.getHistory).toHaveBeenCalledWith(
        requesterUserId,
        {},
      );
    });

    it('passes currency, cursor, and limit query params through', async () => {
      const mockHistory = { items: [], nextCursor: null };
      walletService.getHistory.mockResolvedValue(mockHistory);

      await request(server())
        .get('/wallet/transactions?currency=coins&limit=10&cursor=abc123')
        .expect(200);

      expect(walletService.getHistory).toHaveBeenCalledWith(requesterUserId, {
        currency: 'coins',
        limit: 10,
        cursor: 'abc123',
      });
    });

    it('passes gems currency filter', async () => {
      walletService.getHistory.mockResolvedValue({
        items: [],
        nextCursor: null,
      });

      await request(server())
        .get('/wallet/transactions?currency=gems')
        .expect(200);

      expect(walletService.getHistory).toHaveBeenCalledWith(requesterUserId, {
        currency: 'gems',
      });
    });

    it('rejects limit=200 (exceeds max)', async () => {
      await request(server()).get('/wallet/transactions?limit=200').expect(400);
    });

    it('rejects limit=0', async () => {
      await request(server()).get('/wallet/transactions?limit=0').expect(400);
    });

    it('rejects negative limit', async () => {
      await request(server()).get('/wallet/transactions?limit=-5').expect(400);
    });

    it('rejects non-integer limit', async () => {
      await request(server()).get('/wallet/transactions?limit=5.5').expect(400);
    });

    it('rejects unknown currency', async () => {
      await request(server())
        .get('/wallet/transactions?currency=tickets')
        .expect(400);
    });
  });
});
