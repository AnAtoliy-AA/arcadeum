import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { Types } from 'mongoose';
import { GemPurchasesController } from './gem-purchases.controller';
import { GemPurchasesService } from '../services/gem-purchases.service';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard';
import type { AuthenticatedUser } from '../../auth/jwt/jwt.strategy';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

type ServerHandle = Parameters<typeof request>[0];

const validPackageId = new Types.ObjectId().toString();

describe('GemPurchasesController (integration)', () => {
  let app: INestApplication<App>;
  const server = (): ServerHandle => app.getHttpServer();

  const purchasesService = {
    createOrder: jest.fn(),
    finalizeOrder: jest.fn(),
    listPendingForUser: jest.fn(),
  };

  let requesterUserId = new Types.ObjectId().toString();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GemPurchasesController],
      providers: [{ provide: GemPurchasesService, useValue: purchasesService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest<RequestWithUser>();
          req.user = {
            userId: requesterUserId,
            email: 'player@example.com',
            username: 'player',
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
    purchasesService.createOrder.mockReset();
    purchasesService.finalizeOrder.mockReset();
    purchasesService.listPendingForUser.mockReset();
  });

  describe('JwtAuthGuard rejection (anonymous)', () => {
    let anonApp: INestApplication<App>;

    beforeAll(async () => {
      const moduleRef = await Test.createTestingModule({
        controllers: [GemPurchasesController],
        providers: [
          { provide: GemPurchasesService, useValue: purchasesService },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue({ canActivate: () => false })
        .compile();

      anonApp = moduleRef.createNestApplication();
      await anonApp.init();
    });

    afterAll(async () => {
      await anonApp.close();
    });

    it('rejects POST / without auth (guard returns false)', async () => {
      await request(anonApp.getHttpServer())
        .post('/payments/gems/orders')
        .send({ packageId: validPackageId })
        .expect(403);
    });

    it('rejects POST /:orderId/finalize without auth (guard returns false)', async () => {
      await request(anonApp.getHttpServer())
        .post('/payments/gems/orders/SOME-ORDER/finalize')
        .expect(403);
    });

    it('rejects GET /pending without auth (guard returns false)', async () => {
      await request(anonApp.getHttpServer())
        .get('/payments/gems/orders/pending')
        .expect(403);
    });
  });

  describe('POST /payments/gems/orders', () => {
    it('calls createOrder with correct userId and packageId', async () => {
      const orderResult = {
        orderId: 'PP-NEW-ORDER',
        approveUrl: 'https://paypal.com/approve',
      };
      purchasesService.createOrder.mockResolvedValue(orderResult);

      const res = await request(server())
        .post('/payments/gems/orders')
        .send({ packageId: validPackageId })
        .expect(201);

      expect(purchasesService.createOrder).toHaveBeenCalledWith(
        requesterUserId,
        validPackageId,
      );
      expect(res.body as unknown).toEqual(orderResult);
    });

    it('returns 400 when packageId is not a MongoId', async () => {
      await request(server())
        .post('/payments/gems/orders')
        .send({ packageId: 'not-a-mongo-id' })
        .expect(400);

      expect(purchasesService.createOrder).not.toHaveBeenCalled();
    });

    it('returns 400 when packageId is missing', async () => {
      await request(server())
        .post('/payments/gems/orders')
        .send({})
        .expect(400);

      expect(purchasesService.createOrder).not.toHaveBeenCalled();
    });

    it('returns 400 when packageId is a short numeric string', async () => {
      await request(server())
        .post('/payments/gems/orders')
        .send({ packageId: '12345' })
        .expect(400);
    });
  });

  describe('POST /payments/gems/orders/:orderId/finalize', () => {
    it('calls finalizeOrder with correct userId and orderId', async () => {
      const finalizeResult = {
        success: true,
        gemsCredited: 120,
        newBalance: { coins: 0, gems: 120 },
      };
      purchasesService.finalizeOrder.mockResolvedValue(finalizeResult);

      const res = await request(server())
        .post('/payments/gems/orders/PP-ORDER-456/finalize')
        .expect(201);

      expect(purchasesService.finalizeOrder).toHaveBeenCalledWith(
        requesterUserId,
        'PP-ORDER-456',
      );
      expect(res.body as unknown).toEqual(finalizeResult);
    });
  });

  describe('GET /payments/gems/orders/pending', () => {
    it('calls listPendingForUser with correct userId and returns result', async () => {
      const pendingList = [
        {
          id: new Types.ObjectId().toString(),
          packageId: validPackageId,
          paypalOrderId: 'PP-PENDING-1',
          amountUsdCents: 499,
          gems: 100,
          status: 'pending',
          createdAt: new Date().toISOString(),
          finalizedAt: null,
        },
      ];
      purchasesService.listPendingForUser.mockResolvedValue(pendingList);

      const res = await request(server())
        .get('/payments/gems/orders/pending')
        .expect(200);

      expect(purchasesService.listPendingForUser).toHaveBeenCalledWith(
        requesterUserId,
      );
      expect(res.body as unknown).toEqual(pendingList);
    });

    it('returns empty array when no pending purchases', async () => {
      purchasesService.listPendingForUser.mockResolvedValue([]);

      const res = await request(server())
        .get('/payments/gems/orders/pending')
        .expect(200);

      expect(res.body as unknown).toEqual([]);
    });
  });
});
