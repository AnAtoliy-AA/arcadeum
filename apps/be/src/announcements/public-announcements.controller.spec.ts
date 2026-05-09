import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { PublicAnnouncementsController } from './public-announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { JwtOptionalAuthGuard } from '../auth/jwt/jwt-optional.guard';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import type { AnnouncementPublicItem } from './interfaces/announcement.interface';

interface RequestWithUser {
  user?: AuthenticatedUser | null;
}

type ServerHandle = Parameters<typeof request>[0];

describe('PublicAnnouncementsController (integration)', () => {
  let app: INestApplication<App>;
  const server = (): ServerHandle => app.getHttpServer();
  let attachUser: AuthenticatedUser | null = null;
  const service = {
    getActiveForCaller: jest.fn<
      Promise<AnnouncementPublicItem | null>,
      [boolean, string]
    >(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PublicAnnouncementsController],
      providers: [{ provide: AnnouncementsService, useValue: service }],
    })
      .overrideGuard(JwtOptionalAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest<RequestWithUser>();
          req.user = attachUser;
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
    attachUser = null;
    service.getActiveForCaller.mockReset();
    service.getActiveForCaller.mockResolvedValue(null);
  });

  it('returns { announcement: null } when service returns null', async () => {
    const res = await request(server())
      .get('/announcements/active')
      .expect(200);
    expect(res.body).toEqual({ announcement: null });
  });

  it('anonymous request → service called with isAuthenticated=false', async () => {
    await request(server()).get('/announcements/active').expect(200);
    expect(service.getActiveForCaller).toHaveBeenCalledWith(false, 'en');
  });

  it('authenticated request → service called with isAuthenticated=true', async () => {
    attachUser = {
      userId: '507f1f77bcf86cd799439011',
      email: 'me@x',
      username: 'me',
    } as AuthenticatedUser;
    await request(server()).get('/announcements/active').expect(200);
    expect(service.getActiveForCaller).toHaveBeenCalledWith(true, 'en');
  });

  it('synthetic anon_ user (x-anonymous-id) treated as not authenticated', async () => {
    attachUser = {
      userId: 'anon_abcd',
      email: 'anonymous@example.com',
      username: 'Anonymous',
    } as AuthenticatedUser;
    await request(server()).get('/announcements/active').expect(200);
    expect(service.getActiveForCaller).toHaveBeenCalledWith(false, 'en');
  });

  it('?locale=ru → service called with ru', async () => {
    await request(server()).get('/announcements/active?locale=ru').expect(200);
    expect(service.getActiveForCaller).toHaveBeenCalledWith(false, 'ru');
  });

  it('?locale=invalid → 400', async () => {
    await request(server())
      .get('/announcements/active?locale=invalid')
      .expect(400);
  });

  it('Accept-Language: ru-RU,ru;q=0.9 → service called with ru', async () => {
    await request(server())
      .get('/announcements/active')
      .set('Accept-Language', 'ru-RU,ru;q=0.9,en;q=0.8')
      .expect(200);
    expect(service.getActiveForCaller).toHaveBeenCalledWith(false, 'ru');
  });

  it('Accept-Language: ja (unsupported) → falls back to en', async () => {
    await request(server())
      .get('/announcements/active')
      .set('Accept-Language', 'ja')
      .expect(200);
    expect(service.getActiveForCaller).toHaveBeenCalledWith(false, 'en');
  });

  it('sets Cache-Control: private, max-age=30, stale-while-revalidate=60', async () => {
    const res = await request(server())
      .get('/announcements/active')
      .expect(200);
    expect(res.headers['cache-control']).toBe(
      'private, max-age=30, stale-while-revalidate=60',
    );
  });
});
