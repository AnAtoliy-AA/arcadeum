import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  buildShopHarness,
  effectiveItem,
  type ShopServiceHarness,
} from './shop.service.test-helpers';

describe('ShopService — admin paths', () => {
  let h: ShopServiceHarness;

  beforeEach(async () => {
    h = await buildShopHarness();
  });

  describe('grant', () => {
    it('inserts inventory row + audit row; does NOT touch wallet or equip', async () => {
      h.catalog.getEffective.mockResolvedValue(
        effectiveItem({
          id: 'badge-veteran',
          category: 'badge',
          defaultPriceAmount: 500,
          priceAmount: 500,
        }),
      );

      const result = await h.service.grant(
        h.userId,
        'badge-veteran',
        h.adminId,
        'beta tester comp',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      );

      expect(h.wallet.debit).not.toHaveBeenCalled();
      expect(h.wallet.credit).not.toHaveBeenCalled();
      expect(h.wallet.emitAfterCommit).not.toHaveBeenCalled();
      expect(h.inventoryModel.rows.length).toBe(1);
      expect(h.inventoryModel.rows[0].acquiredVia).toBe('grant');
      expect(h.auditModel.rows.length).toBe(1);
      expect(h.userModel.users.get(h.userId)!.equippedBadgeId).toBeNull();
      expect(result.inventoryItem.acquiredVia).toBe('grant');
    });

    it('is idempotent on repeated nonce', async () => {
      h.catalog.getEffective.mockResolvedValue(
        effectiveItem({
          id: 'badge-veteran',
          category: 'badge',
          defaultPriceAmount: 500,
          priceAmount: 500,
        }),
      );

      const nonce = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
      await h.service.grant(h.userId, 'badge-veteran', h.adminId, 'x', nonce);
      const priorRow = h.inventoryModel.rows[0];
      h.inventory.findByUserAndPurchaseId.mockResolvedValue(priorRow);
      await h.service.grant(h.userId, 'badge-veteran', h.adminId, 'x', nonce);
      expect(h.inventoryModel.rows.length).toBe(1);
    });
  });

  describe('revoke', () => {
    it('soft-deletes row, clears equip slot if equipped, writes audit, NO wallet', async () => {
      const rowId = new Types.ObjectId();
      h.inventoryModel.rows.push({
        _id: rowId,
        userId: new Types.ObjectId(h.userId),
        itemId: 'avatar-fox-01',
        purchaseId: 'grant-1',
        acquiredVia: 'grant',
        soldAt: null,
        createdAt: new Date(),
      });
      const userDoc = h.userModel.users.get(h.userId)!;
      userDoc.equippedAvatarId = 'avatar-fox-01';

      await h.service.revoke(rowId.toString(), h.adminId, 'mistaken grant');

      expect(h.inventoryModel.rows[0].soldAt).toBeInstanceOf(Date);
      expect(h.wallet.debit).not.toHaveBeenCalled();
      expect(h.wallet.credit).not.toHaveBeenCalled();
      expect(h.wallet.emitAfterCommit).not.toHaveBeenCalled();
      expect(h.inventory.clearEquipIfPointsAt).toHaveBeenCalledWith(
        h.userId,
        'avatar-fox-01',
        'avatar',
        expect.anything(),
      );
      expect(h.auditModel.rows.length).toBe(1);
    });

    it('rejects already-sold row', async () => {
      const rowId = new Types.ObjectId();
      h.inventoryModel.rows.push({
        _id: rowId,
        userId: new Types.ObjectId(h.userId),
        itemId: 'avatar-fox-01',
        purchaseId: 'p1',
        acquiredVia: 'coins',
        soldAt: new Date(),
        createdAt: new Date(),
      });
      await expect(
        h.service.revoke(rowId.toString(), h.adminId, 'x'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('setOverride', () => {
    it('writes audit row with before/after values', async () => {
      h.catalog.getEffective.mockResolvedValueOnce(effectiveItem());
      h.catalog.setOverride.mockResolvedValueOnce(
        effectiveItem({ priceAmount: 50, overridden: true }),
      );

      await h.service.setOverride(
        'avatar-fox-01',
        { priceAmount: 50, priceCurrency: 'coins' },
        h.adminId,
      );

      expect(h.auditModel.rows.length).toBe(1);
      expect(h.auditModel.rows[0].action).toBe('override');
    });
  });
});
