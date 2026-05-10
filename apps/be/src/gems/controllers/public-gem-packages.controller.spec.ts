import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { PublicGemPackagesController } from './public-gem-packages.controller';
import { GemPackagesService } from '../services/gem-packages.service';
import type { GemPackagePublic } from '../interfaces/gem-package.interface';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard';
import type { AuthenticatedUser } from '../../auth/jwt/jwt.strategy';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

const buildPublicPkg = (
  overrides: Partial<GemPackagePublic> = {},
): GemPackagePublic => ({
  id: '507f1f77bcf86cd799439011',
  name: 'Starter Pack',
  gems: 100,
  bonusGems: 0,
  priceUsdCents: 499,
  displayOrder: 0,
  ...overrides,
});

describe('PublicGemPackagesController', () => {
  let app: INestApplication<App>;
  let service: { listActive: jest.Mock };

  beforeAll(async () => {
    service = { listActive: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [PublicGemPackagesController],
      providers: [{ provide: GemPackagesService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest<RequestWithUser>();
          req.user = { userId: 'u1', email: 'u@x', username: 'u' };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    service.listActive.mockReset();
  });

  describe('GET /payments/gems/packages', () => {
    it('returns 200 with active packages list', async () => {
      const pkg = buildPublicPkg();
      service.listActive.mockResolvedValue([pkg]);

      const res = await request(app.getHttpServer())
        .get('/payments/gems/packages')
        .expect(200);

      expect(res.body as unknown).toEqual([pkg]);
      expect(service.listActive).toHaveBeenCalledTimes(1);
    });

    it('returns 200 with empty list when no active packages', async () => {
      service.listActive.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get('/payments/gems/packages')
        .expect(200);

      expect(res.body as unknown).toEqual([]);
    });

    it('returns only public fields (no active flag)', async () => {
      const pkg = buildPublicPkg({ priceUsdCents: 999 });
      service.listActive.mockResolvedValue([pkg]);

      const res = await request(app.getHttpServer())
        .get('/payments/gems/packages')
        .expect(200);

      const body = res.body as GemPackagePublic[];
      expect(body[0].priceUsdCents).toBe(999);
      expect(Object.keys(body[0])).not.toContain('active');
    });
  });
});
