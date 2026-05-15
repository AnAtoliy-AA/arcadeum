import { INestApplication, ExecutionContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import request from 'supertest';
import { App } from 'supertest/types';
import { AdminController } from './admin.controller';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { User } from '../auth/schemas/user.schema';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

describe('AdminController (integration)', () => {
  let app: INestApplication<App>;
  let userModel: { findById: jest.Mock };

  const mockRole = (role: string | null) =>
    userModel.findById.mockReturnValue({
      select: () => ({
        lean: () => Promise.resolve(role === null ? null : { role }),
      }),
    });

  beforeAll(async () => {
    userModel = { findById: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        RolesGuard,
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest<RequestWithUser>();
          req.user = {
            userId: 'u1',
            email: 'u@x',
            username: 'u',
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
    userModel.findById.mockReset();
  });

  it('returns 403 for a non-admin role', async () => {
    mockRole('developer');
    await request(app.getHttpServer()).get('/admin/ping').expect(403);
  });

  it('returns 403 when the user record was deleted', async () => {
    mockRole(null);
    await request(app.getHttpServer()).get('/admin/ping').expect(403);
  });

  it('returns 200 { ok: true } for an admin role', async () => {
    mockRole('admin');
    const res = await request(app.getHttpServer())
      .get('/admin/ping')
      .expect(200);
    expect(res.body).toEqual({ ok: true });
  });
});
