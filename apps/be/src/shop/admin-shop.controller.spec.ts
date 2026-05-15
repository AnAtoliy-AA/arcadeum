import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { Types } from 'mongoose';
import { AdminShopController } from './admin-shop.controller';
import { CatalogService } from './services/catalog.service';
import { InventoryService } from './services/inventory.service';
import { ShopService } from './services/shop.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

interface RequestWithUser {
  user?: AuthenticatedUser;
}
type ServerHandle = Parameters<typeof request>[0];

describe('AdminShopController (integration)', () => {
  let app: INestApplication<App>;
  const server = (): ServerHandle => app.getHttpServer();
  const adminUserId = 'admin-user-id';

  const catalog = { listEffective: jest.fn() };
  const inventory = { listForUser: jest.fn() };
  const shop = { setOverride: jest.fn(), grant: jest.fn(), revoke: jest.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AdminShopController],
      providers: [
        { provide: CatalogService, useValue: catalog },
        { provide: InventoryService, useValue: inventory },
        { provide: ShopService, useValue: shop },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest<RequestWithUser>();
          req.user = {
            userId: adminUserId,
            email: 'a@b',
            username: 'admin',
          };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /admin/shop/catalog includes unavailable items', async () => {
    catalog.listEffective.mockResolvedValue([]);
    await request(server()).get('/admin/shop/catalog').expect(200);
    expect(catalog.listEffective).toHaveBeenCalledWith({
      includeUnavailable: true,
    });
  });

  it('PATCH /admin/shop/overrides/:itemId delegates to ShopService', async () => {
    shop.setOverride.mockResolvedValue({ override: {} });
    await request(server())
      .patch('/admin/shop/overrides/avatar-fox-01')
      .send({ priceAmount: 50, priceCurrency: 'coins' })
      .expect(200);
    expect(shop.setOverride).toHaveBeenCalledWith(
      'avatar-fox-01',
      { priceAmount: 50, priceCurrency: 'coins' },
      adminUserId,
    );
  });

  it('PATCH /admin/shop/overrides rejects bad price', async () => {
    await request(server())
      .patch('/admin/shop/overrides/avatar-fox-01')
      .send({ priceAmount: -5, priceCurrency: 'coins' })
      .expect(400);
    expect(shop.setOverride).not.toHaveBeenCalled();
  });

  it('POST /admin/shop/grant rejects when fields invalid', async () => {
    await request(server())
      .post('/admin/shop/grant')
      .send({
        userId: 'not-a-mongo-id',
        itemId: 'x',
        reason: 'r',
        nonce: 'not-uuid',
      })
      .expect(400);
    expect(shop.grant).not.toHaveBeenCalled();
  });

  it('POST /admin/shop/grant delegates on valid input', async () => {
    shop.grant.mockResolvedValue({ inventoryItem: {} });
    const userId = new Types.ObjectId().toHexString();
    await request(server())
      .post('/admin/shop/grant')
      .send({
        userId,
        itemId: 'badge-veteran',
        reason: 'beta tester',
        nonce: '33333333-3333-4333-8333-333333333333',
      })
      .expect(201);
    expect(shop.grant).toHaveBeenCalledWith(
      userId,
      'badge-veteran',
      adminUserId,
      'beta tester',
      '33333333-3333-4333-8333-333333333333',
    );
  });

  it('GET /admin/shop/users/:userId/inventory delegates', async () => {
    inventory.listForUser.mockResolvedValue({
      items: [],
      equipped: {
        avatar: null,
        badge: null,
        name_color: null,
        game_skin: null,
      },
    });
    await request(server())
      .get('/admin/shop/users/user-xyz/inventory')
      .expect(200);
    expect(inventory.listForUser).toHaveBeenCalledWith('user-xyz');
  });

  it('POST /admin/shop/inventory/:rowId/revoke delegates', async () => {
    shop.revoke.mockResolvedValue({ inventoryItem: {}, equipped: {} });
    await request(server())
      .post('/admin/shop/inventory/abc123/revoke')
      .send({ reason: 'mistaken grant' })
      .expect(201);
    expect(shop.revoke).toHaveBeenCalledWith(
      'abc123',
      adminUserId,
      'mistaken grant',
    );
  });
});
