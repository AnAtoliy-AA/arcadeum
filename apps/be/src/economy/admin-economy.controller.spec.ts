import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { Types } from 'mongoose';
import { AdminEconomyController } from './admin-economy.controller';
import { EconomySettingsService } from './economy-settings.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { User } from '../auth/schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import type { EconomySettingView } from './interfaces/economy-setting.interface';
import type { EconomyAuditView } from './interfaces/economy-audit.interface';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

type ServerHandle = Parameters<typeof request>[0];

const makeView = (
  key = 'game_win_coin_reward',
  value = 50,
): EconomySettingView => ({
  key: key as EconomySettingView['key'],
  currentValue: value,
  defaultValue: 50,
  source: 'default',
  updatedAt: null,
  updatedByLabel: null,
});

const makeAudit = (): EconomyAuditView => ({
  id: new Types.ObjectId().toString(),
  fromValue: 50,
  toValue: 100,
  adminLabel: 'Alice',
  changedAt: new Date().toISOString(),
});

describe('AdminEconomyController (integration)', () => {
  let app: INestApplication<App>;
  const server = (): ServerHandle => app.getHttpServer();
  let economyService: {
    listAll: jest.Mock;
    setNumber: jest.Mock;
    resetToDefault: jest.Mock;
    getAuditFor: jest.Mock;
    refreshCache: jest.Mock;
  };
  let adminUserId = new Types.ObjectId().toString();

  beforeAll(async () => {
    economyService = {
      listAll: jest.fn(),
      setNumber: jest.fn(),
      resetToDefault: jest.fn(),
      getAuditFor: jest.fn(),
      refreshCache: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AdminEconomyController],
      providers: [
        RolesGuard,
        { provide: EconomySettingsService, useValue: economyService },
        {
          provide: getModelToken(User.name),
          useValue: { findById: jest.fn() },
        },
      ],
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
    economyService.listAll.mockReset();
    economyService.setNumber.mockReset();
    economyService.resetToDefault.mockReset();
    economyService.getAuditFor.mockReset();
    economyService.refreshCache.mockReset();
  });

  describe('GET /admin/economy', () => {
    it('returns 200 with list of views', async () => {
      const views = [makeView()];
      economyService.listAll.mockResolvedValue(views);

      const res = await request(server()).get('/admin/economy').expect(200);
      expect(res.body as unknown).toEqual(views);
    });
  });

  describe('PUT /admin/economy/:key', () => {
    it('returns 400 when value is 0 (DTO validation)', async () => {
      await request(server())
        .put('/admin/economy/game_win_coin_reward')
        .send({ value: 0 })
        .expect(400);
    });

    it('returns 400 when value exceeds 1M', async () => {
      await request(server())
        .put('/admin/economy/game_win_coin_reward')
        .send({ value: 1_000_001 })
        .expect(400);
    });

    it('returns 400 when value is fractional', async () => {
      await request(server())
        .put('/admin/economy/game_win_coin_reward')
        .send({ value: 1.5 })
        .expect(400);
    });

    it('returns 404 for unknown key', async () => {
      await request(server())
        .put('/admin/economy/not_a_real_key')
        .send({ value: 100 })
        .expect(404);
    });

    it('returns 200 with updated view on happy path', async () => {
      const updatedView = makeView('game_win_coin_reward', 100);
      economyService.setNumber.mockResolvedValue(undefined);
      economyService.listAll.mockResolvedValue([updatedView]);

      const res = await request(server())
        .put('/admin/economy/game_win_coin_reward')
        .send({ value: 100 })
        .expect(200);

      expect(economyService.setNumber).toHaveBeenCalledWith(
        'game_win_coin_reward',
        100,
        adminUserId,
      );
      expect((res.body as EconomySettingView).currentValue).toBe(100);
    });
  });

  describe('DELETE /admin/economy/:key', () => {
    it('returns 204 on happy path', async () => {
      economyService.resetToDefault.mockResolvedValue(undefined);

      await request(server())
        .delete('/admin/economy/game_win_coin_reward')
        .expect(204);

      expect(economyService.resetToDefault).toHaveBeenCalledWith(
        'game_win_coin_reward',
        adminUserId,
      );
    });

    it('returns 404 for unknown key', async () => {
      await request(server()).delete('/admin/economy/unknown_key').expect(404);
    });
  });

  describe('GET /admin/economy/:key/audit', () => {
    it('returns 200 with audit rows', async () => {
      const auditRows = [makeAudit()];
      economyService.getAuditFor.mockResolvedValue(auditRows);

      const res = await request(server())
        .get('/admin/economy/game_win_coin_reward/audit')
        .expect(200);

      expect(res.body as unknown).toEqual(auditRows);
      expect(economyService.getAuditFor).toHaveBeenCalledWith(
        'game_win_coin_reward',
        { limit: undefined },
      );
    });

    it('passes limit query param to service', async () => {
      economyService.getAuditFor.mockResolvedValue([]);

      await request(server())
        .get('/admin/economy/game_win_coin_reward/audit?limit=10')
        .expect(200);

      expect(economyService.getAuditFor).toHaveBeenCalledWith(
        'game_win_coin_reward',
        { limit: 10 },
      );
    });

    it('returns 404 for unknown key', async () => {
      await request(server()).get('/admin/economy/bad_key/audit').expect(404);
    });
  });

  describe('POST /admin/economy/refresh-cache', () => {
    it('returns 204 and calls service.refreshCache()', async () => {
      await request(server()).post('/admin/economy/refresh-cache').expect(204);

      expect(economyService.refreshCache).toHaveBeenCalled();
    });
  });
});
