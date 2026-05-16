import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  buildShopHarness,
  type ShopServiceHarness,
} from './shop.service.test-helpers';

describe('ShopService.sellBack', () => {
  let h: ShopServiceHarness;

  beforeEach(async () => {
    h = await buildShopHarness();
  });

  it('rejects unknown purchaseId', async () => {
    h.inventory.findByUserAndPurchaseId.mockResolvedValue(null);
    await expect(h.service.sellBack(h.userId, 'p1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rejects starter item', async () => {
    h.inventory.findByUserAndPurchaseId.mockResolvedValue({
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(h.userId),
      itemId: 'avatar-default-01',
      purchaseId: `starter-${h.userId}-avatar-default-01`,
      acquiredVia: 'starter',
      paidAmount: 0,
      paidCurrency: 'coins',
      createdAt: new Date(),
    });
    await expect(h.service.sellBack(h.userId, 'p1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects equipped item', async () => {
    const userDoc = h.userModel.users.get(h.userId)!;
    userDoc.equippedAvatarId = 'avatar-fox-01';
    h.inventory.findByUserAndPurchaseId.mockResolvedValue({
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(h.userId),
      itemId: 'avatar-fox-01',
      purchaseId: 'p1',
      acquiredVia: 'coins',
      paidAmount: 200,
      paidCurrency: 'coins',
      createdAt: new Date(),
    });
    await expect(h.service.sellBack(h.userId, 'p1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('refunds 50% in coins for coin item', async () => {
    const rowId = new Types.ObjectId();
    h.inventoryModel.rows.push({
      _id: rowId,
      userId: new Types.ObjectId(h.userId),
      itemId: 'avatar-fox-01',
      purchaseId: 'p1',
      acquiredVia: 'coins',
      paidAmount: 200,
      paidCurrency: 'coins',
      soldAt: null,
      createdAt: new Date(),
    });
    h.inventory.findByUserAndPurchaseId.mockResolvedValue(
      h.inventoryModel.rows[0],
    );
    h.wallet.getBalance.mockResolvedValue({ coins: 900, gems: 50 });

    const result = await h.service.sellBack(h.userId, 'p1');

    expect(h.wallet.credit).toHaveBeenCalledWith(
      h.userId,
      'coins',
      100,
      'shop_sell_refund',
      'shop-sell-p1',
      { itemId: 'avatar-fox-01' },
      expect.anything(),
    );
    expect(result.refundAmount).toBe(100);
    expect(result.refundCurrency).toBe('coins');
    expect(h.wallet.emitAfterCommit).toHaveBeenCalledTimes(1);
  });

  it('refunds in coins via gem-to-coin rate for gem item', async () => {
    const rowId = new Types.ObjectId();
    h.inventoryModel.rows.push({
      _id: rowId,
      userId: new Types.ObjectId(h.userId),
      itemId: 'avatar-dragon-01',
      purchaseId: 'p2',
      acquiredVia: 'gems',
      paidAmount: 3,
      paidCurrency: 'gems',
      soldAt: null,
      createdAt: new Date(),
    });
    h.inventory.findByUserAndPurchaseId.mockResolvedValue(
      h.inventoryModel.rows[0],
    );
    h.wallet.getBalance.mockResolvedValue({ coins: 150, gems: 47 });

    const result = await h.service.sellBack(h.userId, 'p2');

    expect(h.wallet.credit).toHaveBeenCalledWith(
      h.userId,
      'coins',
      150,
      'shop_sell_refund',
      'shop-sell-p2',
      { itemId: 'avatar-dragon-01' },
      expect.anything(),
    );
    expect(result.refundAmount).toBe(150);
  });

  it('does not emit when transaction throws', async () => {
    const rowId = new Types.ObjectId();
    h.inventoryModel.rows.push({
      _id: rowId,
      userId: new Types.ObjectId(h.userId),
      itemId: 'avatar-fox-01',
      purchaseId: 'p1',
      acquiredVia: 'coins',
      paidAmount: 200,
      paidCurrency: 'coins',
      soldAt: null,
      createdAt: new Date(),
    });
    h.inventory.findByUserAndPurchaseId.mockResolvedValue(
      h.inventoryModel.rows[0],
    );
    h.connection.shouldFail = true;
    await expect(h.service.sellBack(h.userId, 'p1')).rejects.toThrow();
    expect(h.wallet.emitAfterCommit).not.toHaveBeenCalled();
  });
});
