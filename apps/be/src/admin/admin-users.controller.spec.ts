import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import request from 'supertest';
import type { App } from 'supertest/types';
import { Types } from 'mongoose';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { User } from '../auth/schemas/user.schema';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

interface AdminUserItemBody {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}
interface ErrorBody {
  code?: string;
  statusCode?: number;
  message?: string;
}
type ServerHandle = Parameters<typeof request>[0];

describe('AdminUsersController (integration)', () => {
  let app: INestApplication<App>;
  const server = (): ServerHandle => app.getHttpServer();
  let userModel: {
    find: jest.Mock;
    findById: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    countDocuments: jest.Mock;
  };
  let requesterUserId = 'requester-id-not-real';

  const buildFindChain = (returnDocs: unknown[]) => ({
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(returnDocs),
  });

  const buildFindByIdChain = (returnDoc: unknown) => ({
    lean: jest.fn().mockResolvedValue(returnDoc),
  });

  beforeAll(async () => {
    userModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      countDocuments: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AdminUsersController],
      providers: [
        AdminUsersService,
        RolesGuard,
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest<RequestWithUser>();
          req.user = {
            userId: requesterUserId,
            email: 'me@x',
            username: 'me',
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
    requesterUserId = new Types.ObjectId().toString();
    userModel.find.mockReset();
    userModel.findById.mockReset();
    userModel.findByIdAndUpdate.mockReset();
    userModel.countDocuments.mockReset();
  });

  describe('GET /admin/users', () => {
    it('returns 200 with default pagination', async () => {
      userModel.find.mockReturnValue(buildFindChain([]));
      userModel.countDocuments.mockResolvedValue(0);

      const res = await request(server()).get('/admin/users').expect(200);

      expect(res.body as unknown).toEqual({
        items: [],
        total: 0,
        page: 1,
        pageSize: 50,
      });
    });

    it('rejects pageSize=999 with 400 (proves ValidationPipe is registered)', async () => {
      await request(server()).get('/admin/users?pageSize=999').expect(400);
    });

    it('rejects unknown query params with 400 (forbidNonWhitelisted)', async () => {
      await request(server()).get('/admin/users?nope=1').expect(400);
    });

    it('rejects invalid role enum with 400', async () => {
      await request(server()).get('/admin/users?role=king').expect(400);
    });
  });

  describe('PATCH /admin/users/:id/role', () => {
    it('returns 200 on success', async () => {
      const targetId = new Types.ObjectId();
      const target = {
        _id: targetId,
        email: 'a@x',
        username: 'a',
        displayName: null,
        role: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updated = { ...target, role: 'admin' };
      userModel.findById.mockReturnValue(buildFindByIdChain(target));
      userModel.findByIdAndUpdate.mockResolvedValue(updated);

      const res = await request(server())
        .patch(`/admin/users/${targetId.toString()}/role`)
        .send({ role: 'admin' })
        .expect(200);

      expect((res.body as AdminUserItemBody).role).toBe('admin');
    });

    it('returns 400 INVALID_USER_ID on bad :id', async () => {
      const res = await request(server())
        .patch('/admin/users/not-an-id/role')
        .send({ role: 'admin' })
        .expect(400);

      expect((res.body as ErrorBody).code).toBe('INVALID_USER_ID');
    });

    it('returns 400 on invalid body role', async () => {
      const id = new Types.ObjectId().toString();
      await request(server())
        .patch(`/admin/users/${id}/role`)
        .send({ role: 'king' })
        .expect(400);
    });

    it('returns 403 SELF_ROLE_CHANGE_FORBIDDEN', async () => {
      const id = new Types.ObjectId().toString();
      requesterUserId = id;

      const res = await request(server())
        .patch(`/admin/users/${id}/role`)
        .send({ role: 'free' })
        .expect(403);

      expect((res.body as ErrorBody).code).toBe('SELF_ROLE_CHANGE_FORBIDDEN');
    });

    it('returns 404 USER_NOT_FOUND when missing', async () => {
      userModel.findById.mockReturnValue(buildFindByIdChain(null));
      const id = new Types.ObjectId().toString();

      const res = await request(server())
        .patch(`/admin/users/${id}/role`)
        .send({ role: 'free' })
        .expect(404);

      expect((res.body as ErrorBody).code).toBe('USER_NOT_FOUND');
    });

    it('returns 409 LAST_ADMIN_PROTECTED', async () => {
      const targetId = new Types.ObjectId();
      const target = {
        _id: targetId,
        email: 'a@x',
        username: 'a',
        displayName: null,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      userModel.findById.mockReturnValue(buildFindByIdChain(target));
      userModel.countDocuments.mockResolvedValue(0);

      const res = await request(server())
        .patch(`/admin/users/${targetId.toString()}/role`)
        .send({ role: 'free' })
        .expect(409);

      expect((res.body as ErrorBody).code).toBe('LAST_ADMIN_PROTECTED');
    });
  });
});
