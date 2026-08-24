import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ShopInventoryBootstrap } from './shop-inventory-bootstrap';
import { User } from '../../auth/schemas/user.schema';
import { UserInventoryItem } from '../schemas/user-inventory-item.schema';
import { InventoryService } from '../services/inventory.service';

class FakeUserModel {
  ids: Types.ObjectId[] = [];
  find() {
    return {
      lean: () => Promise.resolve(this.ids.map((_id) => ({ _id }))),
    };
  }
  estimatedDocumentCount() {
    return Promise.resolve(this.ids.length);
  }
}

class FakeInventoryModel {
  deleteMany = jest.fn().mockResolvedValue({ deletedCount: 5 });
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

  it('purges legacy starter rows and syncs equip slots for all users', async () => {
    const u1 = new Types.ObjectId();
    const u2 = new Types.ObjectId();
    userModel.ids = [u1, u2];
    await bootstrap.runBackfill();
    expect(inventoryModel.deleteMany).toHaveBeenCalledWith({
      acquiredVia: 'starter',
    });
    expect(inventory.grantStarter).toHaveBeenCalledTimes(2);
    expect(inventory.grantStarter).toHaveBeenCalledWith(u1.toString());
    expect(inventory.grantStarter).toHaveBeenCalledWith(u2.toString());
  });

  it('continues past per-user failures', async () => {
    const u1 = new Types.ObjectId();
    const u2 = new Types.ObjectId();
    userModel.ids = [u1, u2];
    inventory.grantStarter
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(undefined);
    await expect(bootstrap.runBackfill()).resolves.toBeUndefined();
    expect(inventory.grantStarter).toHaveBeenCalledTimes(2);
  });

  it('onApplicationBootstrap returns immediately and schedules the backfill', async () => {
    const u1 = new Types.ObjectId();
    userModel.ids = [u1];
    const spy = jest.spyOn(bootstrap, 'runBackfill');
    bootstrap.onApplicationBootstrap();
    expect(spy).not.toHaveBeenCalled();
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
