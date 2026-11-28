import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { User } from '../auth/schemas/user.schema';
import { AdminStreamController } from './admin-stream.controller';
import { StreamServiceController } from './stream-service.controller';
import { StreamServiceGuard } from './stream-service.guard';
import { StreamService } from './stream.service';
import { defaultSettings } from './stream-settings.model';

const SERVICE_TOKEN = 'x'.repeat(40);

interface Req {
  user?: { userId: string; email: string; username: string };
  headers: Record<string, string>;
}

describe('Stream controllers', () => {
  let app: INestApplication<App>;
  let role = 'admin';
  let jwtUser: string | null = 'admin';
  const svc = {
    getSettings: jest.fn(),
    updateSettings: jest.fn(),
    getStatus: jest.fn(),
    getAudit: jest.fn(),
    enqueueCommand: jest.fn(),
    getConfig: jest.fn(),
    pollCommands: jest.fn(),
    ackCommand: jest.fn(),
    saveStatus: jest.fn(),
  };

  const jwtMock = {
    canActivate: (ctx: ExecutionContext) => {
      if (!jwtUser) throw new Error('bad jwt');
      ctx.switchToHttp().getRequest<Req>().user = {
        userId: 'u1',
        email: 'a@b',
        username: jwtUser,
      };
      return true;
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AdminStreamController, StreamServiceController],
      providers: [
        RolesGuard,
        { provide: JwtAuthGuard, useValue: jwtMock },
        StreamServiceGuard,
        { provide: StreamService, useValue: svc },
        {
          provide: ConfigService,
          useValue: {
            get: (k: string) =>
              k === 'STREAM_SERVICE_TOKEN' ? SERVICE_TOKEN : undefined,
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: {
            findById: () => ({
              select: () => ({
                lean: () => Promise.resolve({ role }),
              }),
            }),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(jwtMock)
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

  afterAll(() => app.close());

  beforeEach(() => {
    role = 'admin';
    jwtUser = 'admin';
    Object.values(svc).forEach((m) => m.mockReset());
  });

  const server = () => app.getHttpServer();

  describe('admin endpoints', () => {
    it.each([
      ['get', '/admin/stream/settings'],
      ['get', '/admin/stream/status'],
      ['get', '/admin/stream/audit'],
      ['put', '/admin/stream/settings'],
      ['post', '/admin/stream/command'],
    ] as const)('%s %s is 403 for a non-admin', async (method, url) => {
      role = 'moderator';
      await request(server())[method](url).send({}).expect(403);
      Object.values(svc).forEach((m) => expect(m).not.toHaveBeenCalled());
    });

    it('GET settings returns the view for an admin', async () => {
      svc.getSettings.mockResolvedValue({
        version: 2,
        settings: defaultSettings(),
      });
      const res = await request(server())
        .get('/admin/stream/settings')
        .expect(200);
      expect((res.body as { version: number }).version).toBe(2);
    });

    it('PUT settings validates enums and passes the admin id', async () => {
      await request(server())
        .put('/admin/stream/settings')
        .send({ video: { fps: 60 } })
        .expect(400);
      await request(server())
        .put('/admin/stream/settings')
        .send({ unknownField: 1 })
        .expect(400);
      await request(server())
        .put('/admin/stream/settings')
        .send({ games: { not_a_game: { enabled: true } } })
        .expect(400);
      svc.updateSettings.mockResolvedValue({ version: 3 });
      await request(server())
        .put('/admin/stream/settings')
        .send({
          bot: { moveDelayMs: 3000 },
          games: { chess_v1: { weight: 3 } },
        })
        .expect(200);
      expect(svc.updateSettings).toHaveBeenCalledWith(
        expect.objectContaining({ bot: { moveDelayMs: 3000 } }),
        'u1',
      );
    });

    it('POST command accepts the four commands only', async () => {
      await request(server())
        .post('/admin/stream/command')
        .send({ type: 'format_disk' })
        .expect(400);
      svc.enqueueCommand.mockResolvedValue({ id: 'c1', type: 'skip' });
      for (const type of ['start', 'stop', 'skip', 'restart_browser']) {
        await request(server())
          .post('/admin/stream/command')
          .send({ type })
          .expect(202);
      }
    });
  });

  describe('service endpoints (director)', () => {
    it('rejects missing credentials with 401', async () => {
      await request(server()).get('/stream/config').expect(401);
      expect(svc.getConfig).not.toHaveBeenCalled();
    });

    it('rejects a wrong token when it is not a stream-user JWT', async () => {
      jwtUser = null;
      await request(server())
        .get('/stream/config')
        .set('Authorization', 'Bearer wrong')
        .expect(401);
    });

    it('rejects an admin JWT (only the stream user is allowed)', async () => {
      jwtUser = 'admin';
      await request(server())
        .get('/stream/config')
        .set('Authorization', 'Bearer some.jwt')
        .expect(403);
    });

    it('accepts STREAM_SERVICE_TOKEN and sets an ETag', async () => {
      svc.getConfig.mockResolvedValue({
        version: 5,
        config: defaultSettings(),
      });
      const res = await request(server())
        .get('/stream/config')
        .set('Authorization', `Bearer ${SERVICE_TOKEN}`)
        .expect(200);
      expect(res.headers.etag).toBe('"stream-v5"');
      expect(res.headers['cache-control']).toContain('no-store');
      const body = JSON.stringify(res.body).toLowerCase();
      expect(body).not.toMatch(/rtmp|stream_key|token/);
    });

    it('answers 304 when If-None-Match matches', async () => {
      svc.getConfig.mockResolvedValue({
        version: 5,
        config: defaultSettings(),
      });
      await request(server())
        .get('/stream/config')
        .set('Authorization', `Bearer ${SERVICE_TOKEN}`)
        .set('If-None-Match', '"stream-v5"')
        .expect(304);
      await request(server())
        .get('/stream/config')
        .set('Authorization', `Bearer ${SERVICE_TOKEN}`)
        .set('If-None-Match', '"stream-v4"')
        .expect(200);
    });

    it('accepts the stream user JWT', async () => {
      jwtUser = 'arcadeum_live';
      svc.getConfig.mockResolvedValue({
        version: 1,
        config: defaultSettings(),
      });
      await request(server())
        .get('/stream/config')
        .set('Authorization', 'Bearer some.jwt')
        .expect(200);
    });

    it('validates status payloads and acks commands', async () => {
      const auth = { Authorization: `Bearer ${SERVICE_TOKEN}` };
      await request(server())
        .post('/stream/status')
        .set(auth)
        .send({ state: 'live' })
        .expect(400);
      await request(server())
        .post('/stream/status')
        .set(auth)
        .send({
          state: 'live',
          uptimeSec: 5,
          ffmpegFps: 30,
          ffmpegRestarts: 0,
          gamesPlayed: 1,
          dryRun: false,
          appliedConfigVersion: 2,
          recentErrors: [],
        })
        .expect(204);
      await request(server())
        .post('/stream/commands/abc/ack')
        .set(auth)
        .send({ result: 'maybe' })
        .expect(400);
      await request(server())
        .post('/stream/commands/abc/ack')
        .set(auth)
        .send({ result: 'done' })
        .expect(204);
    });
  });
});
