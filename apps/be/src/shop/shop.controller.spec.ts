import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { ShopController } from './shop.controller';
import { CatalogService } from './services/catalog.service';
import { InventoryService } from './services/inventory.service';
import { ShopService } from './services/shop.service';
import { ShopWalletService } from './services/shop-wallet.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

interface RequestWithUser {
  user?: AuthenticatedUser;
}
type ServerHandle = Parameters<typeof request>[0];

describe('ShopController (integration)', () => {
  let app: INestApplication<App>;
  const server = (): ServerHandle => app.getHttpServer();
  const requesterUserId = 'user-abc';

  const catalog = {
    listEffective: jest.fn(),
  };
  const inventory = {
    listForUser: jest.fn(),
    equip: jest.fn(),
    unequip: jest.fn(),
  };
  const shop = {
    purchase: jest.fn(),
    sellBack: jest.fn(),
  };

  const shopWallet = {
    purchaseWithWallet: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ShopController],
      providers: [
        { provide: CatalogService, useValue: catalog },
        { provide: InventoryService, useValue: inventory },
        { provide: ShopService, useValue: shop },
        { provide: ShopWalletService, useValue: shopWallet },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest<RequestWithUser>();
          req.user = {
            userId: requesterUserId,
            email: 'a@b',
            username: 'tester',
          };
          return true;
        },
      })
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

  it('GET /shop/catalog returns the catalog (no auth needed)', async () => {
    catalog.listEffective.mockResolvedValue([
      { id: 'avatar-fox-01', category: 'avatar' },
    ]);
    const res = await request(server()).get('/shop/catalog').expect(200);
    expect(res.body).toEqual([{ id: 'avatar-fox-01', category: 'avatar' }]);
    expect(catalog.listEffective).toHaveBeenCalledWith({
      category: undefined,
      rarity: undefined,
    });
  });

  it('GET /shop/catalog passes valid category and rarity through', async () => {
    catalog.listEffective.mockResolvedValue([]);
    await request(server())
      .get('/shop/catalog?category=badge&rarity=epic')
      .expect(200);
    expect(catalog.listEffective).toHaveBeenCalledWith({
      category: 'badge',
      rarity: 'epic',
    });
  });

  it('GET /shop/catalog drops invalid category and rarity', async () => {
    catalog.listEffective.mockResolvedValue([]);
    await request(server())
      .get('/shop/catalog?category=bogus&rarity=mythic')
      .expect(200);
    expect(catalog.listEffective).toHaveBeenCalledWith({
      category: undefined,
      rarity: undefined,
    });
  });

  it('GET /shop/inventory calls service with JWT subject', async () => {
    inventory.listForUser.mockResolvedValue({
      items: [],
      equipped: {
        avatar: null,
        badge: null,
        name_color: null,
        game_skin: null,
      },
    });
    await request(server()).get('/shop/inventory').expect(200);
    expect(inventory.listForUser).toHaveBeenCalledWith(requesterUserId);
  });

  it('POST /shop/purchase validates DTO and delegates', async () => {
    shop.purchase.mockResolvedValue({
      inventoryItem: {},
      equipped: {},
      balance: { coins: 0, gems: 0 },
    });
    await request(server())
      .post('/shop/purchase')
      .send({
        itemId: 'avatar-fox-01',
        purchaseId: '11111111-1111-4111-8111-111111111111',
      })
      .expect(201);
    expect(shop.purchase).toHaveBeenCalledWith(
      requesterUserId,
      'avatar-fox-01',
      '11111111-1111-4111-8111-111111111111',
    );
  });

  it('POST /shop/purchase rejects non-UUID purchaseId', async () => {
    await request(server())
      .post('/shop/purchase')
      .send({ itemId: 'avatar-fox-01', purchaseId: 'not-a-uuid' })
      .expect(400);
    expect(shop.purchase).not.toHaveBeenCalled();
  });

  it('POST /shop/sell validates DTO and delegates', async () => {
    shop.sellBack.mockResolvedValue({
      rowId: 'r',
      refundAmount: 100,
      refundCurrency: 'coins',
      balance: { coins: 100, gems: 0 },
    });
    await request(server())
      .post('/shop/sell')
      .send({ purchaseId: '22222222-2222-4222-8222-222222222222' })
      .expect(201);
    expect(shop.sellBack).toHaveBeenCalledWith(
      requesterUserId,
      '22222222-2222-4222-8222-222222222222',
    );
  });

  it('POST /shop/equip validates DTO and delegates', async () => {
    inventory.equip.mockResolvedValue({
      avatar: 'avatar-fox-01',
      badge: null,
      name_color: null,
      game_skin: null,
    });
    await request(server())
      .post('/shop/equip')
      .send({ itemId: 'avatar-fox-01' })
      .expect(201);
    expect(inventory.equip).toHaveBeenCalledWith(
      requesterUserId,
      'avatar-fox-01',
    );
  });

  it('POST /shop/unequip rejects invalid category', async () => {
    await request(server())
      .post('/shop/unequip')
      .send({ category: 'mythic' })
      .expect(400);
    expect(inventory.unequip).not.toHaveBeenCalled();
  });

  it('POST /shop/unequip accepts a valid category', async () => {
    inventory.unequip.mockResolvedValue({
      avatar: null,
      badge: null,
      name_color: null,
      game_skin: null,
    });
    await request(server())
      .post('/shop/unequip')
      .send({ category: 'badge' })
      .expect(201);
    expect(inventory.unequip).toHaveBeenCalledWith(requesterUserId, 'badge');
  });
});
