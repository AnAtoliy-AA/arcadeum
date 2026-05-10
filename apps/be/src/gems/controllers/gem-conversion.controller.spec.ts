import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { GemConversionController } from './gem-conversion.controller';
import { GemConversionService } from '../services/gem-conversion.service';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard';
import type { AuthenticatedUser } from '../../auth/jwt/jwt.strategy';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

type ServerHandle = Parameters<typeof request>[0];

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';
const TEST_USER_ID = 'test-user-id-123';

describe('GemConversionController', () => {
  let app: INestApplication<App>;
  const server = (): ServerHandle => app.getHttpServer();

  const conversionService = {
    convertGemsToCoins: jest.fn(),
    getRate: jest.fn().mockReturnValue(100),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GemConversionController],
      providers: [
        { provide: GemConversionService, useValue: conversionService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest<RequestWithUser>();
          req.user = {
            userId: TEST_USER_ID,
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
    conversionService.convertGemsToCoins.mockReset();
  });

  describe('route is guarded', () => {
    let anonApp: INestApplication<App>;

    beforeAll(async () => {
      const moduleRef = await Test.createTestingModule({
        controllers: [GemConversionController],
        providers: [
          { provide: GemConversionService, useValue: conversionService },
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

    it('returns 403 without authentication', async () => {
      await request(anonApp.getHttpServer())
        .post('/wallet/convert-gems-to-coins')
        .send({ gems: 100, conversionId: VALID_UUID })
        .expect(403);

      expect(conversionService.convertGemsToCoins).not.toHaveBeenCalled();
    });
  });

  describe('DTO validation', () => {
    it('returns 400 when conversionId is not a valid UUID', async () => {
      await request(server())
        .post('/wallet/convert-gems-to-coins')
        .send({ gems: 100, conversionId: 'not-a-uuid' })
        .expect(400);

      expect(conversionService.convertGemsToCoins).not.toHaveBeenCalled();
    });

    it('returns 400 when gems is missing', async () => {
      await request(server())
        .post('/wallet/convert-gems-to-coins')
        .send({ conversionId: VALID_UUID })
        .expect(400);
    });

    it('returns 400 when gems is 0', async () => {
      await request(server())
        .post('/wallet/convert-gems-to-coins')
        .send({ gems: 0, conversionId: VALID_UUID })
        .expect(400);
    });

    it('returns 400 when gems exceeds 1_000_000', async () => {
      await request(server())
        .post('/wallet/convert-gems-to-coins')
        .send({ gems: 1_000_001, conversionId: VALID_UUID })
        .expect(400);
    });

    it('returns 400 when gems is a float', async () => {
      await request(server())
        .post('/wallet/convert-gems-to-coins')
        .send({ gems: 1.5, conversionId: VALID_UUID })
        .expect(400);
    });

    it('returns 400 when conversionId is missing', async () => {
      await request(server())
        .post('/wallet/convert-gems-to-coins')
        .send({ gems: 100 })
        .expect(400);
    });
  });

  describe('POST /wallet/convert-gems-to-coins', () => {
    it('calls convertGemsToCoins with correct args on happy path', async () => {
      const mockResult = {
        gemsDebited: 100,
        coinsCredited: 10_000,
        newBalance: { coins: 10_000, gems: 0 },
        rate: 100,
      };
      conversionService.convertGemsToCoins.mockResolvedValue(mockResult);

      const res = await request(server())
        .post('/wallet/convert-gems-to-coins')
        .send({ gems: 100, conversionId: VALID_UUID })
        .expect(201);

      expect(conversionService.convertGemsToCoins).toHaveBeenCalledWith(
        TEST_USER_ID,
        100,
        VALID_UUID,
      );
      expect(res.body as unknown).toEqual(mockResult);
    });
  });
});
