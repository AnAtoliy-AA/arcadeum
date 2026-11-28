jest.mock('../../solana/solana.service', () => ({ SolanaService: class {} }));
jest.mock('../../solana/lib/arc-payment.service', () => ({
  ArcPaymentService: class {},
}));

import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ShopWalletService } from './shop-wallet.service';

const USER = new Types.ObjectId().toHexString();

function make(
  over: {
    flag?: number;
    redeemed?: boolean;
    verify?: jest.Mock;
    currency?: string;
    price?: number;
  } = {},
) {
  const inventoryModel = {
    findOne: jest.fn().mockReturnValue({
      lean: () => ({
        exec: () => Promise.resolve(over.redeemed ? { _id: 1 } : null),
      }),
    }),
    create: jest.fn(),
  };
  const inventory = {
    findByUserAndPurchaseId: jest.fn().mockResolvedValue(null),
    findLiveByItem: jest.fn().mockResolvedValue(null),
  };
  const catalog = {
    getEffective: jest.fn().mockResolvedValue({
      id: 'frame-1',
      available: true,
      priceCurrency: over.currency ?? 'arcadeum',
      priceAmount: 250,
      category: 'frame',
    }),
  };
  const arcPayment = {
    verifyAndRedeem: over.verify ?? jest.fn().mockResolvedValue('new'),
  };
  const economy = {
    getNumber: jest.fn((key: string) =>
      Promise.resolve(
        key === 'gem_to_usd_rate'
          ? 0.1
          : key === 'arcadeum_discount_percent'
            ? 10
            : (over.flag ?? 1),
      ),
    ),
  };
  const solana = {
    getArcadeumPrice: jest.fn().mockResolvedValue(over.price ?? 0.00001),
  };
  const svc = new ShopWalletService(
    { startSession: undefined } as never,
    {} as never,
    inventoryModel as never,
    catalog as never,
    inventory as never,
    { getBalance: jest.fn(), emitAfterCommit: jest.fn() } as never,
    solana as never,
    arcPayment as never,
    economy as never,
  );
  return { svc, arcPayment, catalog, inventoryModel };
}

describe('ShopWalletService.purchaseWithWallet (ARC)', () => {
  it('respects shop_allow_arcadeum: off => rejected before any chain call', async () => {
    const { svc, arcPayment } = make({ flag: 0 });
    await expect(
      svc.purchaseWithWallet(USER, 'frame-1', 'p1', 'sig', 'W'),
    ).rejects.toThrow('shop.arcPaymentDisabled');
    expect(arcPayment.verifyAndRedeem).not.toHaveBeenCalled();
  });

  it('a signature already stored on an inventory row is a replay', async () => {
    const { svc, arcPayment } = make({ redeemed: true });
    await expect(
      svc.purchaseWithWallet(USER, 'frame-1', 'p1', 'sig', 'W'),
    ).rejects.toThrow('shop.signatureAlreadyUsed');
    expect(arcPayment.verifyAndRedeem).not.toHaveBeenCalled();
  });

  it('verifies the exact catalog price and does not deliver when verification fails', async () => {
    const verify = jest
      .fn()
      .mockRejectedValue(new BadRequestException('shop.paymentTooLow'));
    const { svc, inventoryModel } = make({ verify });
    await expect(
      svc.purchaseWithWallet(USER, 'frame-1', 'p1', 'sig', 'W'),
    ).rejects.toThrow('shop.paymentTooLow');
    expect(verify).toHaveBeenCalledWith({
      userId: USER,
      signature: 'sig',
      senderAddress: 'W',
      expectedAmount: 250,
      kind: 'shop',
      subjectId: 'frame-1',
    });
    expect(inventoryModel.create).not.toHaveBeenCalled();
  });

  it('gem-priced items are payable in ARC at the quote the UI shows', async () => {
    // 250 gems * $0.10 = $25, -10% = $22.5, at $0.00001/ARC = 2_250_000 ARC
    const verify = jest.fn().mockRejectedValue(new Error('stop'));
    const { svc } = make({ verify, currency: 'gems' });
    await svc
      .purchaseWithWallet(USER, 'frame-1', 'p1', 'sig', 'W')
      .catch(() => 0);
    expect(verify).toHaveBeenCalledWith(
      expect.objectContaining({ expectedAmount: 2_250_000, kind: 'shop' }),
    );
  });

  it('refuses a gem-priced ARC quote when the ARC price is unavailable', async () => {
    const { svc, arcPayment } = make({ currency: 'gems', price: 0 });
    await expect(
      svc.purchaseWithWallet(USER, 'frame-1', 'p1', 'sig', 'W'),
    ).rejects.toThrow('shop.arcPriceUnavailable');
    expect(arcPayment.verifyAndRedeem).not.toHaveBeenCalled();
  });

  it('coin-priced items cannot be bought with ARC', async () => {
    const { svc } = make({ currency: 'coins' });
    await expect(
      svc.purchaseWithWallet(USER, 'frame-1', 'p1', 'sig', 'W'),
    ).rejects.toThrow('shop.walletPaymentOnlyForArc');
  });
});
