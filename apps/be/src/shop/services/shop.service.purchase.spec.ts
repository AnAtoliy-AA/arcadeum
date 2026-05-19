import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  buildShopHarness,
  effectiveItem,
  type ShopServiceHarness,
} from './shop.service.test-helpers';

describe('ShopService.purchase', () => {
  let h: ShopServiceHarness;

  beforeEach(async () => {
    h = await buildShopHarness();
  });

  it('happy path: debits wallet, inserts row, equips, emits', async () => {
    h.catalog.getEffective.mockResolvedValue(effectiveItem());
    h.wallet.getBalance.mockResolvedValue({ coins: 800, gems: 50 });

    const result = await h.service.purchase(
      h.userId,
      'avatar-fox-01',
      '11111111-1111-1111-1111-111111111111',
    );

    expect(h.wallet.debit).toHaveBeenCalledWith(
      h.userId,
      'coins',
      200,
      'shop_purchase',
      'shop-buy-11111111-1111-1111-1111-111111111111',
      { itemId: 'avatar-fox-01' },
      expect.anything(),
    );
    expect(h.inventoryModel.rows.length).toBe(1);
    expect(h.userModel.users.get(h.userId)!.equippedAvatarId).toBe(
      'avatar-fox-01',
    );
    expect(h.wallet.emitAfterCommit).toHaveBeenCalledTimes(1);
    expect(result.balance).toEqual({ coins: 800, gems: 50 });
    expect(result.equipped.avatar).toBe('avatar-fox-01');
  });

  it('short-circuits to prior row on retry', async () => {
    const priorId = new Types.ObjectId();
    h.inventory.findByUserAndPurchaseId.mockResolvedValue({
      _id: priorId,
      userId: new Types.ObjectId(h.userId),
      itemId: 'avatar-fox-01',
      purchaseId: 'p1',
      acquiredVia: 'coins',
      paidAmount: 200,
      paidCurrency: 'coins',
      createdAt: new Date(),
    });
    h.wallet.getBalance.mockResolvedValue({ coins: 800, gems: 50 });

    const result = await h.service.purchase(h.userId, 'avatar-fox-01', 'p1');

    expect(h.wallet.debit).not.toHaveBeenCalled();
    expect(h.inventoryModel.rows.length).toBe(0);
    expect(result.inventoryItem.rowId).toBe(priorId.toString());
  });

  it('short-circuits when user already owns a live row — no debit, no new row, ensures equipped', async () => {
    const existingId = new Types.ObjectId();
    h.catalog.getEffective.mockResolvedValue(effectiveItem());
    h.inventory.findLiveByItem.mockResolvedValue({
      _id: existingId,
      userId: new Types.ObjectId(h.userId),
      itemId: 'avatar-fox-01',
      purchaseId: 'earlier-purchase',
      acquiredVia: 'coins',
      paidAmount: 200,
      paidCurrency: 'coins',
      createdAt: new Date(),
    });
    h.wallet.getBalance.mockResolvedValue({ coins: 800, gems: 50 });

    const result = await h.service.purchase(
      h.userId,
      'avatar-fox-01',
      '22222222-2222-2222-2222-222222222222',
    );

    expect(h.wallet.debit).not.toHaveBeenCalled();
    expect(h.inventoryModel.rows.length).toBe(0);
    expect(h.wallet.emitAfterCommit).not.toHaveBeenCalled();
    expect(result.inventoryItem.rowId).toBe(existingId.toString());
    expect(h.userModel.users.get(h.userId)!.equippedAvatarId).toBe(
      'avatar-fox-01',
    );
    expect(result.equipped.avatar).toBe('avatar-fox-01');
    expect(result.balance).toEqual({ coins: 800, gems: 50 });
  });

  it('rejects unknown item with 404', async () => {
    h.catalog.getEffective.mockResolvedValue(null);
    await expect(
      h.service.purchase(h.userId, 'bogus', 'p1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects unavailable item with 400', async () => {
    h.catalog.getEffective.mockResolvedValue(
      effectiveItem({ available: false, overridden: true }),
    );
    await expect(
      h.service.purchase(h.userId, 'avatar-fox-01', 'p1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('does not emit when transaction throws', async () => {
    h.catalog.getEffective.mockResolvedValue(effectiveItem());
    h.connection.shouldFail = true;
    await expect(
      h.service.purchase(h.userId, 'avatar-fox-01', 'p1'),
    ).rejects.toThrow();
    expect(h.wallet.emitAfterCommit).not.toHaveBeenCalled();
  });
});
