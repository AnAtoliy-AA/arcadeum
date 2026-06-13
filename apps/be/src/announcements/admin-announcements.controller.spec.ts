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
import { AdminAnnouncementsController } from './admin-announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { Announcement } from './schemas/announcement.schema';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { User } from '../auth/schemas/user.schema';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { NotificationDispatcher } from '../notifications/notifications.dispatcher';
import { NotificationsService } from '../notifications/notifications.service';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

interface ErrorBody {
  code?: string;
  statusCode?: number;
  message?: string | string[];
}

type ServerHandle = Parameters<typeof request>[0];

describe('AdminAnnouncementsController (integration)', () => {
  let app: INestApplication<App>;
  const server = (): ServerHandle => app.getHttpServer();
  let model: {
    find: jest.Mock;
    findById: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    findByIdAndDelete: jest.Mock;
    countDocuments: jest.Mock;
    create: jest.Mock;
  };
  let requesterUserId = new Types.ObjectId().toString();
  let requesterRole: 'admin' | 'user' = 'admin';

  const buildFindChain = (returnDocs: unknown[]) => ({
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(returnDocs),
  });

  const buildFindByIdChain = (returnDoc: unknown) => ({
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(returnDoc),
  });

  beforeAll(async () => {
    model = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest.fn(),
      create: jest.fn(),
    };

    const userModelStub = {
      findById: jest.fn().mockImplementation(() => ({
        select: () => ({
          lean: () => Promise.resolve({ role: requesterRole }),
        }),
      })),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AdminAnnouncementsController],
      providers: [
        AnnouncementsService,
        RolesGuard,
        { provide: getModelToken(Announcement.name), useValue: model },
        { provide: getModelToken(User.name), useValue: userModelStub },
        {
          provide: NotificationDispatcher,
          useValue: { dispatch: jest.fn(), dispatchMany: jest.fn() },
        },
        {
          provide: NotificationsService,
          useValue: {
            listUserIdsWithCategoryEnabled: jest.fn().mockResolvedValue([]),
          },
        },
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
            role: requesterRole,
          } as AuthenticatedUser;
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
    requesterUserId = new Types.ObjectId().toString();
    requesterRole = 'admin';
    Object.values(model).forEach((m) => m.mockReset());
  });

  describe('auth', () => {
    it('returns 403 when caller has role=user', async () => {
      requesterRole = 'user';
      await request(server()).get('/admin/announcements').expect(403);
    });
  });

  describe('GET /admin/announcements', () => {
    it('returns 200 with empty list', async () => {
      model.find.mockReturnValue(buildFindChain([]));
      model.countDocuments.mockResolvedValue(0);

      const res = await request(server())
        .get('/admin/announcements')
        .expect(200);

      expect(res.body).toEqual({ items: [], total: 0, page: 1, pageSize: 25 });
    });

    it('rejects pageSize=999 with 400', async () => {
      await request(server())
        .get('/admin/announcements?pageSize=999')
        .expect(400);
    });

    it('rejects unknown query with 400', async () => {
      await request(server()).get('/admin/announcements?nope=1').expect(400);
    });
  });

  describe('POST /admin/announcements', () => {
    it('creates with valid body', async () => {
      const id = new Types.ObjectId();
      model.create.mockResolvedValue({ _id: id });
      model.findById.mockReturnValue(
        buildFindByIdChain({
          _id: id,
          severity: 'info',
          severityRank: 1,
          audience: 'all',
          startsAt: null,
          endsAt: null,
          content: { en: { title: 'Hi' } },
          createdBy: { _id: new Types.ObjectId(), displayName: 'Admin' },
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      const res = await request(server())
        .post('/admin/announcements')
        .send({
          severity: 'info',
          content: { en: { title: 'Hi' } },
        })
        .expect(201);

      expect((res.body as { id: string }).id).toBe(id.toString());
    });

    it('rejects javascript: ctaHref', async () => {
      const res = await request(server())
        .post('/admin/announcements')
        .send({
          severity: 'info',
          content: {
            en: { title: 'X', ctaHref: 'javascript:alert(1)' },
          },
        })
        .expect(400);

      const msgs = (res.body as ErrorBody).message;
      expect(JSON.stringify(msgs)).toMatch(/https URL|root-relative/i);
    });

    it('rejects endsAt < startsAt', async () => {
      const res = await request(server())
        .post('/admin/announcements')
        .send({
          severity: 'info',
          content: { en: { title: 'X' } },
          startsAt: '2026-05-10T00:00:00Z',
          endsAt: '2026-05-09T00:00:00Z',
        })
        .expect(400);

      const msgs = (res.body as ErrorBody).message;
      expect(JSON.stringify(msgs)).toMatch(/strictly after|isAfter/i);
    });

    it('rejects unknown body fields', async () => {
      await request(server())
        .post('/admin/announcements')
        .send({
          severity: 'info',
          content: { en: { title: 'X' } },
          extraField: 1,
        })
        .expect(400);
    });

    it('rejects invalid severity', async () => {
      await request(server())
        .post('/admin/announcements')
        .send({
          severity: 'panic',
          content: { en: { title: 'X' } },
        })
        .expect(400);
    });
  });

  describe('PATCH /admin/announcements/:id', () => {
    it('returns 400 INVALID_ANNOUNCEMENT_ID on bad id', async () => {
      const res = await request(server())
        .patch('/admin/announcements/not-an-id')
        .send({ severity: 'warning' })
        .expect(400);

      expect((res.body as ErrorBody).code).toBe('INVALID_ANNOUNCEMENT_ID');
    });

    it('returns 404 ANNOUNCEMENT_NOT_FOUND when missing', async () => {
      model.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const res = await request(server())
        .patch(`/admin/announcements/${new Types.ObjectId().toString()}`)
        .send({ severity: 'warning' })
        .expect(404);

      expect((res.body as ErrorBody).code).toBe('ANNOUNCEMENT_NOT_FOUND');
    });
  });

  describe('DELETE /admin/announcements/:id', () => {
    it('returns 204 on success', async () => {
      model.findByIdAndDelete.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
      });

      await request(server())
        .delete(`/admin/announcements/${new Types.ObjectId().toString()}`)
        .expect(204);
    });

    it('returns 404 when missing', async () => {
      model.findByIdAndDelete.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await request(server())
        .delete(`/admin/announcements/${new Types.ObjectId().toString()}`)
        .expect(404);
    });
  });
});
