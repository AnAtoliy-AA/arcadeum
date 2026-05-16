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
  estimatedDocumentCount() {
    return Promise.resolve(this.ids.length);
  }
}

class FakeInventoryModel {
  rows: Array<{ userId: Types.ObjectId; itemId: string; acquiredVia: string }> =
    [];

  aggregate() {
    // Mirrors the production aggregation: returns user ids whose starter rows
    // cover the full starter set.
    const starterIds = listStarterItems().map((s) => s.id);
    const byUser = new Map<string, Set<string>>();
    for (const row of this.rows) {
      if (row.acquiredVia !== 'starter') continue;
      if (!starterIds.includes(row.itemId)) continue;
      const key = row.userId.toString();
      const set = byUser.get(key) ?? new Set<string>();
      set.add(row.itemId);
      byUser.set(key, set);
    }
    const result = [...byUser.entries()]
      .filter(([, items]) => items.size === starterIds.length)
      .map(([userId]) => ({ _id: new Types.ObjectId(userId) }));
    return Promise.resolve(result);
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
    await bootstrap.runBackfill();
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
    await bootstrap.runBackfill();
    expect(inventory.grantStarter).not.toHaveBeenCalled();
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

  it('is idempotent on repeated boot', async () => {
    const u1 = new Types.ObjectId();
    userModel.ids = [u1];
    await bootstrap.runBackfill();
    // After first boot we simulate that user now has starters
    for (const starter of listStarterItems()) {
      inventoryModel.rows.push({
        userId: u1,
        itemId: starter.id,
        acquiredVia: 'starter',
      });
    }
    inventory.grantStarter.mockClear();
    await bootstrap.runBackfill();
    expect(inventory.grantStarter).not.toHaveBeenCalled();
  });

  it('onApplicationBootstrap returns immediately and schedules the backfill', async () => {
    const u1 = new Types.ObjectId();
    userModel.ids = [u1];
    const spy = jest.spyOn(bootstrap, 'runBackfill');
    bootstrap.onApplicationBootstrap();
    // The deferred task has not run yet because we are still on the same tick.
    expect(spy).not.toHaveBeenCalled();
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
