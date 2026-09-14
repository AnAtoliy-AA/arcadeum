import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { Types } from 'mongoose';
import { DailyRewardsController } from './daily-rewards.controller';
import { DailyRewardsService } from './daily-rewards.service';
import { DailyRewardAlreadyClaimedError } from './daily-rewards.errors';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

type ServerHandle = Parameters<typeof request>[0];

describe('DailyRewardsController (integration)', () => {
  let app: INestApplication<App>;
  const server = (): ServerHandle => app.getHttpServer();
  let service: {
    getStatus: jest.Mock;
    claim: jest.Mock;
    buyFreezeTokens: jest.Mock;
  };
  let currentUserId: string;
  // Toggle from a test to simulate the "no token" / unauthorized branch.
  let authPasses = true;

  beforeAll(async () => {
    service = {
      getStatus: jest.fn(),
      claim: jest.fn(),
      buyFreezeTokens: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [DailyRewardsController],
      providers: [{ provide: DailyRewardsService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          if (!authPasses) return false;
          const req = ctx.switchToHttp().getRequest<RequestWithUser>();
          req.user = {
            userId: currentUserId,
            email: 'u@x',
            username: 'user',
          };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    currentUserId = new Types.ObjectId().toString();
    authPasses = true;
    service.getStatus.mockReset();
    service.claim.mockReset();
    service.buyFreezeTokens.mockReset();
  });

  describe('GET /daily-rewards/me', () => {
    it('returns 200 with the status payload from the service', async () => {
      const payload = {
        canClaim: true,
        nextDay: 1,
        currentStreak: 0,
        nextRewardCoins: 10,
        nextRewardGems: 0,
        nextResetAt: '2026-05-12T00:00:00.000Z',
      };
      service.getStatus.mockResolvedValue(payload);

      const res = await request(server()).get('/daily-rewards/me').expect(200);

      expect(service.getStatus).toHaveBeenCalledWith(currentUserId);
      expect(res.body).toEqual(payload);
    });

    it('returns 403 (guard blocks) when JwtAuthGuard rejects', async () => {
      authPasses = false;
      await request(server()).get('/daily-rewards/me').expect(403);
      expect(service.getStatus).not.toHaveBeenCalled();
    });
  });

  describe('POST /daily-rewards/claim', () => {
    it('returns 201 with the claim result on success', async () => {
      const payload = {
        awardedCoins: 10,
        awardedGems: 0,
        currentStreak: 1,
        coinsBalanceAfter: 10,
        gemsBalanceAfter: null,
      };
      service.claim.mockResolvedValue(payload);

      const res = await request(server())
        .post('/daily-rewards/claim')
        .expect(201);

      expect(service.claim).toHaveBeenCalledWith(currentUserId);
      expect(res.body).toEqual(payload);
    });

    it('returns 409 when the service throws DailyRewardAlreadyClaimedError', async () => {
      service.claim.mockRejectedValue(
        new DailyRewardAlreadyClaimedError(currentUserId, '2026-05-11'),
      );
      await request(server()).post('/daily-rewards/claim').expect(409);
    });

    it('returns 403 (guard blocks) when JwtAuthGuard rejects', async () => {
      authPasses = false;
      await request(server()).post('/daily-rewards/claim').expect(403);
      expect(service.claim).not.toHaveBeenCalled();
    });
  });

  describe('POST /daily-rewards/buy-freeze', () => {
    it('returns 201 with freeze tokens and coins spent', async () => {
      const payload = { freezeTokens: 3, coinsSpent: 300 };
      service.buyFreezeTokens.mockResolvedValue(payload);

      const res = await request(server())
        .post('/daily-rewards/buy-freeze')
        .send({ quantity: 3 })
        .expect(201);

      expect(service.buyFreezeTokens).toHaveBeenCalledWith(currentUserId, 3);
      expect(res.body).toEqual(payload);
    });

    it('returns 400 when quantity is invalid', async () => {
      await request(server())
        .post('/daily-rewards/buy-freeze')
        .send({ quantity: 0 })
        .expect(400);
      expect(service.buyFreezeTokens).not.toHaveBeenCalled();
    });

    it('returns 400 when quantity is missing', async () => {
      await request(server())
        .post('/daily-rewards/buy-freeze')
        .send({})
        .expect(400);
      expect(service.buyFreezeTokens).not.toHaveBeenCalled();
    });

    it('returns 403 (guard blocks) when JwtAuthGuard rejects', async () => {
      authPasses = false;
      await request(server())
        .post('/daily-rewards/buy-freeze')
        .send({ quantity: 1 })
        .expect(403);
      expect(service.buyFreezeTokens).not.toHaveBeenCalled();
    });
  });
});
