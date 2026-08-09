import { ExecutionContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PublicAnnouncementsController } from './public-announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { JwtOptionalAuthGuard } from '../auth/jwt/jwt-optional.guard';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import type { AnnouncementPublicItem } from './interfaces/announcement.interface';

interface RequestWithUser {
  user?: AuthenticatedUser | null;
}

describe('PublicAnnouncementsController', () => {
  let controller: PublicAnnouncementsController;
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

    controller = moduleRef.get(PublicAnnouncementsController);
  });

  beforeEach(() => {
    attachUser = null;
    service.getActiveForCaller.mockReset();
    service.getActiveForCaller.mockResolvedValue(null);
  });

  function mockRes() {
    const headers: Record<string, string> = {};
    return {
      setHeader: jest.fn((key: string, value: string) => {
        headers[key] = value;
      }),
      _headers: headers,
    } as unknown as {
      setHeader: (k: string, v: string) => void;
      _headers: Record<string, string>;
    };
  }

  it('returns { announcement: null } when service returns null', async () => {
    const res = mockRes();
    const result = await controller.active({}, undefined, { user: null }, res);
    expect(result).toEqual({ announcement: null });
  });

  it('anonymous request → service called with isAuthenticated=false', async () => {
    const res = mockRes();
    await controller.active({}, undefined, { user: null }, res);
    expect(service.getActiveForCaller).toHaveBeenCalledWith(false, 'en');
  });

  it('authenticated request → service called with isAuthenticated=true', async () => {
    attachUser = {
      userId: '507f1f77bcf86cd799439011',
      email: 'me@x',
      username: 'me',
    };
    const res = mockRes();
    await controller.active({}, undefined, { user: attachUser }, res);
    expect(service.getActiveForCaller).toHaveBeenCalledWith(true, 'en');
  });

  it('synthetic anon_ user treated as not authenticated', async () => {
    const anonUser = {
      userId: 'anon_abcd',
      email: 'anonymous@example.com',
      username: 'Anonymous',
    };
    const res = mockRes();
    await controller.active({}, undefined, { user: anonUser }, res);
    expect(service.getActiveForCaller).toHaveBeenCalledWith(false, 'en');
  });

  it('?locale=ru → service called with ru', async () => {
    const res = mockRes();
    await controller.active(
      { locale: 'ru' } as never,
      undefined,
      { user: null },
      res,
    );
    expect(service.getActiveForCaller).toHaveBeenCalledWith(false, 'ru');
  });

  it('?locale=invalid → passes raw locale to service (pipe validates externally)', async () => {
    const res = mockRes();
    await controller.active(
      { locale: 'invalid' } as never,
      undefined,
      { user: null },
      res,
    );
    expect(service.getActiveForCaller).toHaveBeenCalledWith(false, 'invalid');
  });

  it('Accept-Language: ru-RU → service called with ru', async () => {
    const res = mockRes();
    await controller.active({}, 'ru-RU,ru;q=0.9,en;q=0.8', { user: null }, res);
    expect(service.getActiveForCaller).toHaveBeenCalledWith(false, 'ru');
  });

  it('Accept-Language: ja (unsupported) → falls back to en', async () => {
    const res = mockRes();
    await controller.active({}, 'ja', { user: null }, res);
    expect(service.getActiveForCaller).toHaveBeenCalledWith(false, 'en');
  });

  it('sets Cache-Control header', async () => {
    const res = mockRes();
    await controller.active({}, undefined, { user: null }, res);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'private, max-age=30, stale-while-revalidate=60',
    );
  });
});
