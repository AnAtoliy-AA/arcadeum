import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ShopInventoryBootstrap } from './shop-inventory-bootstrap';
import { User } from '../../auth/schemas/user.schema';
import { UserInventoryItem } from '../schemas/user-inventory-item.schema';
import { InventoryService } from '../services/inventory.service';
import { listStarterItems } from './shop-catalog';

class FakeUserModel {
  ids: Types.ObjectId[] = [];
  find() {
    return {
      lean: () => Promise.resolve(this.ids.map((_id) => ({ _id }))),
    };
  }
}

class FakeInventoryModel {
  rows: Array<{ userId: Types.ObjectId; itemId: string; acquiredVia: string }> =
    [];
  find(filter: { userId: Types.ObjectId; acquiredVia: string }) {
    return {
      lean: () =>
        Promise.resolve(
          this.rows
            .filter(
              (r) =>
                r.userId.toString() === filter.userId.toString() &&
                r.acquiredVia === filter.acquiredVia,
            )
            .map((r) => ({ itemId: r.itemId })),
        ),
    };
  }
}

describe('ShopInventoryBootstrap', () => {
  let bootstrap: ShopInventoryBootstrap;
  let userModel: FakeUserModel;
  let inventoryModel: FakeInventoryModel;
  let inventory: jest.Mocked<InventoryService>;

  beforeEach(async () => {
    userModel = new FakeUserModel();
    inventoryModel = new FakeInventoryModel();
    inventory = {
      grantStarter: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<InventoryService>;

    const module = await Test.createTestingModule({
      providers: [
        ShopInventoryBootstrap,
        { provide: getModelToken(User.name), useValue: userModel },
        {
          provide: getModelToken(UserInventoryItem.name),
          useValue: inventoryModel,
        },
        { provide: InventoryService, useValue: inventory },
      ],
    }).compile();
    bootstrap = module.get(ShopInventoryBootstrap);
  });

  it('grants starters to users who lack them', async () => {
    const u1 = new Types.ObjectId();
    const u2 = new Types.ObjectId();
    userModel.ids = [u1, u2];
    await bootstrap.onApplicationBootstrap();
    expect(inventory.grantStarter).toHaveBeenCalledTimes(2);
    expect(inventory.grantStarter).toHaveBeenCalledWith(u1.toString());
    expect(inventory.grantStarter).toHaveBeenCalledWith(u2.toString());
  });

  it('skips users who already own all starters', async () => {
    const u1 = new Types.ObjectId();
    userModel.ids = [u1];
    for (const starter of listStarterItems()) {
      inventoryModel.rows.push({
        userId: u1,
        itemId: starter.id,
        acquiredVia: 'starter',
      });
    }
    await bootstrap.onApplicationBootstrap();
    expect(inventory.grantStarter).not.toHaveBeenCalled();
  });

  it('continues past per-user failures', async () => {
    const u1 = new Types.ObjectId();
    const u2 = new Types.ObjectId();
    userModel.ids = [u1, u2];
    inventory.grantStarter
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(undefined);
    await expect(bootstrap.onApplicationBootstrap()).resolves.toBeUndefined();
    expect(inventory.grantStarter).toHaveBeenCalledTimes(2);
  });

  it('is idempotent on repeated boot', async () => {
    const u1 = new Types.ObjectId();
    userModel.ids = [u1];
    await bootstrap.onApplicationBootstrap();
    // After first boot we simulate that user now has starters
    for (const starter of listStarterItems()) {
      inventoryModel.rows.push({
        userId: u1,
        itemId: starter.id,
        acquiredVia: 'starter',
      });
    }
    inventory.grantStarter.mockClear();
    await bootstrap.onApplicationBootstrap();
    expect(inventory.grantStarter).not.toHaveBeenCalled();
  });
});
