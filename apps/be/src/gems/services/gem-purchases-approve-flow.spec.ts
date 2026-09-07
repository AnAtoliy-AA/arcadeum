import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { GemPurchasesService } from './gem-purchases.service';
import { GemPackage } from '../schemas/gem-package.schema';
import { GemPurchase } from '../schemas/gem-purchase.schema';
import { PaypalGateway } from '../../payments/lib/paypal.gateway';
import { WalletService } from '../../wallet/wallet.service';
import { SolanaService } from '../../solana/solana.service';
import { EconomySettingsService } from '../../economy/economy-settings.service';

const oid = () => new Types.ObjectId();

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
) => ({
  _id: overrides._id ?? oid(),
  userId: overrides.userId ?? oid(),
  packageId: overrides.packageId ?? oid(),
  paypalOrderId: overrides.paypalOrderId ?? 'PP-ORDER',
  amountUsd: overrides.amountUsd ?? 499,
  gems: overrides.gems ?? 120,
  status: overrides.status ?? 'pending',
  createdAt: overrides.createdAt ?? new Date(),
  finalizedAt: overrides.finalizedAt,
  walletTxId: overrides.walletTxId,
  save: jest.fn().mockResolvedValue(undefined),
});

describe('GemPurchasesService - APPROVED → captureOrder flow', () => {
  let service: GemPurchasesService;
  let purchaseModel: { findOne: jest.Mock };
  let paypal: { getOrder: jest.Mock; captureOrder: jest.Mock };
  let wallet: { credit: jest.Mock; getBalance: jest.Mock };

  beforeEach(async () => {
    purchaseModel = { findOne: jest.fn() };
    paypal = { getOrder: jest.fn(), captureOrder: jest.fn() };
    wallet = { credit: jest.fn(), getBalance: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        GemPurchasesService,
        { provide: getModelToken(GemPackage.name), useValue: {} },
        { provide: getModelToken(GemPurchase.name), useValue: purchaseModel },
        { provide: PaypalGateway, useValue: paypal },
        { provide: WalletService, useValue: wallet },
        { provide: SolanaService, useValue: {} },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        {
          provide: EconomySettingsService,
          useValue: { getNumber: jest.fn().mockResolvedValue(0) },
        },
      ],
    }).compile();

    service = module.get(GemPurchasesService);
  });

  it('captures order when PayPal status is APPROVED', async () => {
    const userId = oid().toString();
    const purchaseId = oid();
    const pkgId = oid();
    const walletTxId = oid();
    const paypalOrderId = 'PP-APPROVED-ORDER';

    const purchase = buildPurchaseDoc({
      _id: purchaseId,
      packageId: pkgId,
      paypalOrderId,
      amountUsd: 499,
      gems: 120,
      status: 'pending',
    });
    purchaseModel.findOne.mockResolvedValue(purchase);

    // First call returns APPROVED
    paypal.getOrder.mockResolvedValue({
      id: paypalOrderId,
      status: 'APPROVED',
      intent: 'CAPTURE',
    });

    // captureOrder returns COMPLETED
    paypal.captureOrder.mockResolvedValue({
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

    expect(paypal.captureOrder).toHaveBeenCalledWith(paypalOrderId);
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

  it('throws BadRequestException when order is not APPROVED or COMPLETED', async () => {
    const userId = oid().toString();
    const paypalOrderId = 'PP-PENDING-ORDER';

    const purchase = buildPurchaseDoc({
      paypalOrderId,
      status: 'pending',
    });
    purchaseModel.findOne.mockResolvedValue(purchase);

    paypal.getOrder.mockResolvedValue({
      id: paypalOrderId,
      status: 'PENDING',
      intent: 'CAPTURE',
    });

    await expect(service.finalizeOrder(userId, paypalOrderId)).rejects.toThrow(
      BadRequestException,
    );

    expect(paypal.captureOrder).not.toHaveBeenCalled();
    expect(wallet.credit).not.toHaveBeenCalled();
  });
});
