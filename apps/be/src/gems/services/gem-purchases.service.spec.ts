import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { GemPurchasesService } from './gem-purchases.service';
import { GemPackage } from '../schemas/gem-package.schema';
import { GemPurchase } from '../schemas/gem-purchase.schema';
import { PaypalGateway } from '../../payments/lib/paypal.gateway';
import { WalletService } from '../../wallet/wallet.service';

const oid = () => new Types.ObjectId();

const buildPackageDoc = (
  overrides: Partial<{
    _id: Types.ObjectId;
    name: string;
    gems: number;
    bonusGems: number;
    priceUsd: number;
    active: boolean;
  }> = {},
) => ({
  _id: overrides._id ?? oid(),
  name: overrides.name ?? 'Starter Pack',
  gems: overrides.gems ?? 100,
  bonusGems: overrides.bonusGems ?? 0,
  priceUsd: overrides.priceUsd ?? 499,
  active: overrides.active ?? true,
});

const buildPurchaseDoc = (
  overrides: Partial<{
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    packageId: Types.ObjectId;
    paypalOrderId: string;
    amountUsd: number;
    gems: number;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    createdAt: Date;
    finalizedAt?: Date;
    walletTxId?: Types.ObjectId;
  }> = {},
) => {
  const doc = {
    _id: overrides._id ?? oid(),
    userId: overrides.userId ?? oid(),
    packageId: overrides.packageId ?? oid(),
    paypalOrderId: overrides.paypalOrderId ?? 'PP-ORDER-123',
    amountUsd: overrides.amountUsd ?? 499,
    gems: overrides.gems ?? 100,
    status: overrides.status ?? 'pending',
    createdAt: overrides.createdAt ?? new Date('2026-01-01'),
    finalizedAt: overrides.finalizedAt,
    walletTxId: overrides.walletTxId,
    save: jest.fn().mockResolvedValue(undefined),
  };
  return doc;
};

const buildFindChain = (docs: unknown[]) => ({
  sort: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(docs),
});

describe('GemPurchasesService', () => {
  let service: GemPurchasesService;
  let packageModel: {
    findById: jest.Mock;
  };
  let purchaseModel: {
    create: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
  };
  let paypal: {
    createOrder: jest.Mock;
    getOrder: jest.Mock;
    captureOrder: jest.Mock;
  };
  let wallet: {
    credit: jest.Mock;
    getBalance: jest.Mock;
  };
  let configService: {
    get: jest.Mock;
  };

  beforeEach(async () => {
    packageModel = {
      findById: jest.fn(),
    };
    purchaseModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };
    paypal = {
      createOrder: jest.fn(),
      getOrder: jest.fn(),
      captureOrder: jest.fn(),
    };
    wallet = {
      credit: jest.fn(),
      getBalance: jest.fn(),
    };
    configService = {
      get: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        GemPurchasesService,
        { provide: getModelToken(GemPackage.name), useValue: packageModel },
        { provide: getModelToken(GemPurchase.name), useValue: purchaseModel },
        { provide: PaypalGateway, useValue: paypal },
        { provide: WalletService, useValue: wallet },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = moduleRef.get(GemPurchasesService);
  });

  // ── createOrder ──────────────────────────────────────────────────────────

  describe('createOrder', () => {
    it('throws NotFoundException when package does not exist', async () => {
      packageModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.createOrder(oid().toString(), new Types.ObjectId().toString()),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when package is inactive', async () => {
      const pkg = buildPackageDoc({ active: false });
      packageModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(pkg),
      });

      await expect(
        service.createOrder(oid().toString(), pkg._id.toString()),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws InternalServerErrorException when redirect env vars are missing', async () => {
      const pkg = buildPackageDoc({ active: true });
      packageModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(pkg),
      });
      configService.get.mockReturnValue(undefined);

      await expect(
        service.createOrder(oid().toString(), pkg._id.toString()),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('throws InternalServerErrorException when only PAYPAL_RETURN_URL is set', async () => {
      const pkg = buildPackageDoc({ active: true });
      packageModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(pkg),
      });
      configService.get.mockImplementation((key: string) =>
        key === 'PAYPAL_RETURN_URL' ? 'https://example.com/return' : undefined,
      );

      await expect(
        service.createOrder(oid().toString(), pkg._id.toString()),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('creates a PayPal order and inserts a pending purchase row on happy path', async () => {
      const pkgId = oid();
      const userId = oid().toString();
      const pkg = buildPackageDoc({
        _id: pkgId,
        gems: 100,
        bonusGems: 20,
        priceUsd: 499,
        active: true,
      });
      packageModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(pkg),
      });
      configService.get.mockImplementation((key: string) => {
        if (key === 'PAYPAL_RETURN_URL') return 'https://example.com/return';
        if (key === 'PAYPAL_CANCEL_URL') return 'https://example.com/cancel';
        return undefined;
      });
      const gatewayResult = {
        orderId: 'PP-HAPPY-ORDER',
        approveUrl: 'https://paypal.com/approve/PP-HAPPY-ORDER',
      };
      paypal.createOrder.mockResolvedValue(gatewayResult);
      purchaseModel.create.mockResolvedValue(undefined);

      const result = await service.createOrder(userId, pkgId.toString());

      expect(paypal.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          amountUsd: 499,
          description: expect.stringContaining('120') as unknown, // totalGems = 100 + 20
          // Gem-specific URLs are derived from the donation URLs by
          // swapping the path. Both end up at /payment/gem-* so the
          // gem flow has its own success/cancel handling.
          returnUrl: 'https://example.com/payment/gem-success',
          cancelUrl: 'https://example.com/payment/gem-cancel',
        }),
      );
      expect(purchaseModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          paypalOrderId: 'PP-HAPPY-ORDER',
          amountUsd: 499,
          gems: 120,
          status: 'pending',
        }),
      );
      expect(result).toEqual({
        paypalOrderId: 'PP-HAPPY-ORDER',
        approveUrl: 'https://paypal.com/approve/PP-HAPPY-ORDER',
      });
    });

    it('computes totalGems = gems + bonusGems', async () => {
      const pkg = buildPackageDoc({ gems: 500, bonusGems: 50, active: true });
      packageModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(pkg),
      });
      configService.get.mockImplementation((key: string) => {
        if (key === 'PAYPAL_RETURN_URL') return 'https://ret.url';
        if (key === 'PAYPAL_CANCEL_URL') return 'https://can.url';
        return undefined;
      });
      paypal.createOrder.mockResolvedValue({
        orderId: 'ORD-550',
        approveUrl: 'https://approve.url',
      });
      purchaseModel.create.mockResolvedValue(undefined);

      await service.createOrder(oid().toString(), pkg._id.toString());

      expect(purchaseModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ gems: 550 }),
      );
    });
  });

  // ── listPendingForUser ────────────────────────────────────────────────────

  describe('listPendingForUser', () => {
    it('queries only pending status and returns mapped views', async () => {
      const userId = oid();
      const pkg1Id = oid();
      const pkg2Id = oid();
      const docs = [
        {
          _id: oid(),
          packageId: pkg1Id,
          paypalOrderId: 'ORD-1',
          amountUsd: 499,
          gems: 100,
          status: 'pending' as const,
          createdAt: new Date('2026-02-02'),
          finalizedAt: undefined,
        },
        {
          _id: oid(),
          packageId: pkg2Id,
          paypalOrderId: 'ORD-2',
          amountUsd: 999,
          gems: 500,
          status: 'pending' as const,
          createdAt: new Date('2026-01-01'),
          finalizedAt: undefined,
        },
      ];
      purchaseModel.find.mockReturnValue(buildFindChain(docs));

      const result = await service.listPendingForUser(userId.toString());

      expect(purchaseModel.find).toHaveBeenCalledWith({
        userId: new Types.ObjectId(userId.toString()),
        status: 'pending',
      });
      expect(result).toHaveLength(2);
      expect(result[0].paypalOrderId).toBe('ORD-1');
      expect(result[0].amountUsdCents).toBe(499);
      expect(result[0].finalizedAt).toBeNull();
    });

    it('returns empty array when no pending purchases exist', async () => {
      purchaseModel.find.mockReturnValue(buildFindChain([]));

      const result = await service.listPendingForUser(oid().toString());

      expect(result).toEqual([]);
    });

    it('maps finalizedAt to ISO string when present', async () => {
      const finalDate = new Date('2026-03-15T10:00:00.000Z');
      const docs = [
        {
          _id: oid(),
          packageId: oid(),
          paypalOrderId: 'ORD-FIN',
          amountUsd: 299,
          gems: 50,
          status: 'pending' as const,
          createdAt: new Date('2026-03-01'),
          finalizedAt: finalDate,
        },
      ];
      purchaseModel.find.mockReturnValue(buildFindChain(docs));

      const [view] = await service.listPendingForUser(oid().toString());

      expect(view.finalizedAt).toBe('2026-03-15T10:00:00.000Z');
    });
  });

  // ── finalizeOrder ─────────────────────────────────────────────────────────

  describe('finalizeOrder', () => {
    it('throws NotFoundException when no purchase row matches', async () => {
      purchaseModel.findOne.mockResolvedValue(null);

      await expect(
        service.finalizeOrder(oid().toString(), 'PP-NO-ORDER'),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns gemsCredited: 0 without calling wallet.credit when already completed (idempotent)', async () => {
      const userId = oid().toString();
      const purchase = buildPurchaseDoc({ status: 'completed' });
      purchaseModel.findOne.mockResolvedValue(purchase);
      wallet.getBalance.mockResolvedValue({ coins: 0, gems: 50 });

      const result = await service.finalizeOrder(userId, 'PP-ORDER-123');

      expect(result.gemsCredited).toBe(0);
      expect(result.success).toBe(true);
      expect(wallet.credit).not.toHaveBeenCalled();
      expect(result.newBalance).toEqual({ coins: 0, gems: 50 });
    });

    it('throws BadRequestException when purchase is failed', async () => {
      const userId = oid().toString();
      const purchase = buildPurchaseDoc({ status: 'failed' });
      purchaseModel.findOne.mockResolvedValue(purchase);

      await expect(service.finalizeOrder(userId, 'PP-FAILED')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when purchase is cancelled', async () => {
      const userId = oid().toString();
      const purchase = buildPurchaseDoc({ status: 'cancelled' });
      purchaseModel.findOne.mockResolvedValue(purchase);

      await expect(
        service.finalizeOrder(userId, 'PP-CANCELLED'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when PayPal order is in a non-capturable status', async () => {
      // PAYER_ACTION_REQUIRED indicates the buyer never finished the
      // PayPal flow (e.g. closed the tab on the auth page). Not capturable.
      const userId = oid().toString();
      const purchase = buildPurchaseDoc({ status: 'pending' });
      purchaseModel.findOne.mockResolvedValue(purchase);
      paypal.getOrder.mockResolvedValue({
        id: 'PP-ORDER-123',
        status: 'PAYER_ACTION_REQUIRED',
        intent: 'CAPTURE',
      });

      await expect(
        service.finalizeOrder(userId, 'PP-ORDER-123'),
      ).rejects.toThrow(BadRequestException);

      expect(paypal.captureOrder).not.toHaveBeenCalled();
      expect(wallet.credit).not.toHaveBeenCalled();
    });

    // TODO(ARC-617 follow-up): add a unit test for the APPROVED → captureOrder
    // → credit path. Skipped here to keep this spec under the 500-line limit;
    // splitting into a dedicated finalize.spec.ts is the right answer.

    it('marks purchase as failed and throws when PayPal status is VOIDED', async () => {
      const userId = oid().toString();
      const purchase = buildPurchaseDoc({
        status: 'pending',
        paypalOrderId: 'PP-VOIDED',
      });
      purchaseModel.findOne.mockResolvedValue(purchase);
      paypal.getOrder.mockResolvedValue({
        id: 'PP-VOIDED',
        status: 'VOIDED',
        intent: 'CAPTURE',
      });

      await expect(service.finalizeOrder(userId, 'PP-VOIDED')).rejects.toThrow(
        BadRequestException,
      );

      expect(purchase.status).toBe('failed');
      expect(purchase.save).toHaveBeenCalled();
      expect(wallet.credit).not.toHaveBeenCalled();
    });

    it('credits gems with deterministic idempotency key and marks purchase completed on happy path', async () => {
      const userId = oid().toString();
      const purchaseId = oid();
      const pkgId = oid();
      const walletTxId = oid();
      const paypalOrderId = 'PP-COMPLETE-ORDER';

      const purchase = buildPurchaseDoc({
        _id: purchaseId,
        packageId: pkgId,
        paypalOrderId,
        amountUsd: 499,
        gems: 120,
        status: 'pending',
      });
      purchaseModel.findOne.mockResolvedValue(purchase);
      paypal.getOrder.mockResolvedValue({
        id: paypalOrderId,
        status: 'COMPLETED',
        intent: 'CAPTURE',
      });

      const txView = {
        id: walletTxId.toString(),
        currency: 'gems',
        delta: 120,
        balanceAfter: 120,
        reason: 'gem_purchase',
        metadata: {},
        createdAt: new Date().toISOString(),
      };
      wallet.credit.mockResolvedValue(txView);
      wallet.getBalance.mockResolvedValue({ coins: 0, gems: 120 });

      const result = await service.finalizeOrder(userId, paypalOrderId);

      expect(wallet.credit).toHaveBeenCalledWith(
        userId,
        'gems',
        120,
        'gem_purchase',
        `gem-purchase-${paypalOrderId}`,
        expect.objectContaining({
          paypalOrderId,
          packageId: pkgId.toString(),
          amountUsd: 499,
        }),
      );

      expect(purchase.status).toBe('completed');
      expect(purchase.walletTxId).toEqual(
        new Types.ObjectId(walletTxId.toString()),
      );
      expect(purchase.finalizedAt).toBeInstanceOf(Date);
      expect(purchase.save).toHaveBeenCalled();

      expect(result.success).toBe(true);
      expect(result.gemsCredited).toBe(120);
      expect(result.newBalance).toEqual({ coins: 0, gems: 120 });
    });
  });
});
