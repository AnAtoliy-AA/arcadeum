/**
 * GameVisibility integration tests — boots the controller, service, DTO
 * ValidationPipe, and a real Mongoose model against an in-memory MongoDB.
 *
 * We avoid importing the full `GameVisibilityModule` here because it pulls in
 * `AuthModule` (and transitively `ReferralModule`/`WalletModule`/
 * `EconomyModule`) just to satisfy the `JwtAuthGuard` / `RolesGuard` DI graph.
 * Since both guards are overridden at the testing-module level via
 * `.overrideGuard()` — which short-circuits their DI resolution — we compose
 * a minimal module here with just the pieces under test. This keeps the
 * integration surface focused on the controller + service + Mongo round-trip
 * (which is what Task 8 is verifying).
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { App } from 'supertest/types';
import { GameVisibilityController } from './game-visibility.controller';
import { GameVisibilityService } from './game-visibility.service';
import { GameVisibility, GameVisibilitySchema } from './game-visibility.schema';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import type { AdminGameVisibilityRow } from './game-visibility.types';

interface RequestWithUser {
  user?: { userId: string };
}

interface ExecCtxLike {
  switchToHttp(): { getRequest(): RequestWithUser };
}

describe('GameVisibility integration', () => {
  let app: INestApplication<App>;
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongo.getUri()),
        MongooseModule.forFeature([
          { name: GameVisibility.name, schema: GameVisibilitySchema },
        ]),
      ],
      controllers: [GameVisibilityController],
      providers: [GameVisibilityService],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecCtxLike) => {
          ctx.switchToHttp().getRequest().user = { userId: 'admin-1' };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  }, 60_000);

  afterAll(async () => {
    await app.close();
    await mongo.stop();
  }, 30_000);

  it('PUT then GET returns the new tier', async () => {
    await request(app.getHttpServer())
      .put('/admin/games/glimworm_v1/visibility')
      .send({ tier: 'vip_plus' })
      .expect(200);
    const res = await request(app.getHttpServer())
      .get('/admin/games/visibility')
      .expect(200);
    const body = res.body as AdminGameVisibilityRow[];
    const glim = body.find((r) => r.gameId === 'glimworm_v1');
    expect(glim?.tier).toBe('vip_plus');
  });

  it('PUT with invalid tier returns 400', async () => {
    await request(app.getHttpServer())
      .put('/admin/games/glimworm_v1/visibility')
      .send({ tier: 'bogus' })
      .expect(400);
  });

  it('PUT with unknown gameId returns 400', async () => {
    await request(app.getHttpServer())
      .put('/admin/games/unknown_v1/visibility')
      .send({ tier: 'vip_plus' })
      .expect(400);
  });

  it('PUT variant with unknown variant returns 400', async () => {
    await request(app.getHttpServer())
      .put('/admin/games/glimworm_v1/variants/bogus/visibility')
      .send({ tier: 'vip_plus' })
      .expect(400);
  });
});
