import {
  BadRequestException,
  ExecutionContext,
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import request from 'supertest';
import type { App } from 'supertest/types';
import { Types } from 'mongoose';
import { AdminGemPackagesController } from './admin-gem-packages.controller';
import { GemPackagesService } from '../services/gem-packages.service';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard';
import { User } from '../../auth/schemas/user.schema';
import type { AuthenticatedUser } from '../../auth/jwt/jwt.strategy';
import type { GemPackageAdmin } from '../interfaces/gem-package.interface';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

const mockAdminId = new Types.ObjectId().toHexString();

const buildAdminPkg = (
  overrides: Partial<GemPackageAdmin> = {},
): GemPackageAdmin => ({
  id: new Types.ObjectId().toHexString(),
  name: 'Pro Pack',
  gems: 500,
  bonusGems: 50,
  priceUsdCents: 999,
  displayOrder: 1,
  active: true,
  createdAt: new Date('2026-01-01').toISOString(),
  updatedAt: new Date('2026-01-02').toISOString(),
  ...overrides,
});

describe('AdminGemPackagesController', () => {
  let app: INestApplication<App>;
  let userModel: { findById: jest.Mock };
  let service: {
    listAllForAdmin: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeAll(async () => {
    userModel = {
      findById: jest.fn().mockReturnValue({
        select: () => ({ lean: () => Promise.resolve({ role: 'admin' }) }),
      }),
    };
    service = {
      listAllForAdmin: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AdminGemPackagesController],
      providers: [
        RolesGuard,
        { provide: GemPackagesService, useValue: service },
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest<RequestWithUser>();
          req.user = {
            userId: mockAdminId,
            email: 'admin@x',
            username: 'admin',
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
    service.listAllForAdmin.mockReset();
    service.create.mockReset();
    service.update.mockReset();
    service.delete.mockReset();
  });

  describe('GET /admin/gem-packages', () => {
    it('returns 200 with all packages including inactive', async () => {
      const packages = [
        buildAdminPkg({ active: true }),
        buildAdminPkg({ active: false }),
      ];
      service.listAllForAdmin.mockResolvedValue(packages);

      const res = await request(app.getHttpServer())
        .get('/admin/gem-packages')
        .expect(200);

      expect(res.body as unknown).toEqual(packages);
      expect(service.listAllForAdmin).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /admin/gem-packages', () => {
    it('returns 201 and the created package', async () => {
      const pkg = buildAdminPkg({ name: 'New Pack' });
      service.create.mockResolvedValue(pkg);

      const res = await request(app.getHttpServer())
        .post('/admin/gem-packages')
        .send({ name: 'New Pack', gems: 200, priceUsdCents: 499 })
        .expect(201);

      expect((res.body as GemPackageAdmin).name).toBe('New Pack');
    });

    it('rejects negative gems with 400', async () => {
      await request(app.getHttpServer())
        .post('/admin/gem-packages')
        .send({ name: 'Bad', gems: -1, priceUsdCents: 100 })
        .expect(400);

      expect(service.create).not.toHaveBeenCalled();
    });

    it('rejects non-integer priceUsdCents with 400', async () => {
      await request(app.getHttpServer())
        .post('/admin/gem-packages')
        .send({ name: 'Bad', gems: 100, priceUsdCents: 9.99 })
        .expect(400);

      expect(service.create).not.toHaveBeenCalled();
    });

    it('rejects priceUsdCents above maximum with 400', async () => {
      await request(app.getHttpServer())
        .post('/admin/gem-packages')
        .send({ name: 'Expensive', gems: 100, priceUsdCents: 100_001 })
        .expect(400);

      expect(service.create).not.toHaveBeenCalled();
    });

    it('rejects missing required fields with 400', async () => {
      await request(app.getHttpServer())
        .post('/admin/gem-packages')
        .send({ gems: 100 })
        .expect(400);
    });
  });

  describe('PATCH /admin/gem-packages/:id', () => {
    it('returns 200 with updated package', async () => {
      const id = new Types.ObjectId().toHexString();
      const updated = buildAdminPkg({ id, name: 'Updated' });
      service.update.mockResolvedValue(updated);

      const res = await request(app.getHttpServer())
        .patch(`/admin/gem-packages/${id}`)
        .send({ name: 'Updated' })
        .expect(200);

      expect((res.body as GemPackageAdmin).name).toBe('Updated');
      expect(service.update).toHaveBeenCalledWith(id, { name: 'Updated' });
    });

    it('returns 404 when package not found', async () => {
      const id = new Types.ObjectId().toHexString();
      service.update.mockRejectedValue(
        new NotFoundException('gems.packageNotFound'),
      );

      await request(app.getHttpServer())
        .patch(`/admin/gem-packages/${id}`)
        .send({ name: 'X' })
        .expect(404);
    });
  });

  describe('DELETE /admin/gem-packages/:id', () => {
    it('returns 204 on successful delete', async () => {
      const id = new Types.ObjectId().toHexString();
      service.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete(`/admin/gem-packages/${id}`)
        .expect(204);

      expect(service.delete).toHaveBeenCalledWith(id);
    });

    it('returns 404 when package not found', async () => {
      const id = new Types.ObjectId().toHexString();
      service.delete.mockRejectedValue(
        new NotFoundException('gems.packageNotFound'),
      );

      await request(app.getHttpServer())
        .delete(`/admin/gem-packages/${id}`)
        .expect(404);
    });

    it('returns 400 when pending purchases exist', async () => {
      const id = new Types.ObjectId().toHexString();
      service.delete.mockRejectedValue(
        new BadRequestException('gems.packageHasPendingPurchases'),
      );

      await request(app.getHttpServer())
        .delete(`/admin/gem-packages/${id}`)
        .expect(400);
    });
  });
});
