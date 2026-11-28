jest.mock('../../solana/lib/arc-payment.service', () => ({
  ArcPaymentService: class {},
}));
jest.mock('../../solana/solana.service', () => ({ SolanaService: class {} }));

import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { GemPurchasesService } from './gem-purchases.service';

const USER = new Types.ObjectId().toHexString();
const PKG = new Types.ObjectId();
const SIG = 'sig';

function make(
  over: {
    flag?: number;
    price?: number;
    pkg?: object | null;
    verify?: jest.Mock;
    existingTx?: unknown;
  } = {},
) {
  const wallet = {
    credit: jest.fn().mockResolvedValue({ balanceAfter: 300 }),
    getBalance: jest
      .fn()
      .mockResolvedValue({ coins: 0, gems: 300, arcadeum: 0 }),
    findByIdempotencyKey: jest.fn().mockResolvedValue(over.existingTx ?? null),
  };
  const arcPayment = {
    verifyAndRedeem: over.verify ?? jest.fn().mockResolvedValue('new'),
  };
  const economy = {
    getNumber: jest.fn((key: string) =>
      Promise.resolve(
        key === 'gems_allow_arcadeum'
          ? (over.flag ?? 1)
          : key === 'arcadeum_discount_percent'
            ? 10
            : 0,
      ),
    ),
  };
  const solana = {
    getArcadeumPrice: jest.fn().mockResolvedValue(over.price ?? 0.00001),
  };
  const pkg =
    over.pkg === undefined
      ? {
          _id: PKG,
          name: 'p',
          gems: 100,
          bonusGems: 10,
          priceUsd: 500,
          active: true,
        }
      : over.pkg;
  const packageModel = {
    findById: jest.fn().mockReturnValue({ lean: () => Promise.resolve(pkg) }),
  };
  const svc = new GemPurchasesService(
    packageModel as never,
    {} as never,
    {} as never,
    wallet as never,
    {} as never,
    solana as never,
    arcPayment as never,
    economy as never,
  );
  return { svc, wallet, arcPayment, solana };
}

describe('GemPurchasesService.purchaseWithArc', () => {
  it('respects the gems_allow_arcadeum flag (off => disabled, nothing verified)', async () => {
    const { svc, arcPayment } = make({ flag: 0 });
    await expect(
      svc.purchaseWithArc(USER, PKG.toHexString(), SIG, 'W'),
    ).rejects.toThrow('gems.arcPaymentDisabled');
    expect(arcPayment.verifyAndRedeem).not.toHaveBeenCalled();
  });

  it('refuses to quote when the price is unavailable/stale (0)', async () => {
    const { svc, arcPayment } = make({ price: 0 });
    await expect(
      svc.purchaseWithArc(USER, PKG.toHexString(), SIG, 'W'),
    ).rejects.toThrow('gems.arcPriceUnavailable');
    expect(arcPayment.verifyAndRedeem).not.toHaveBeenCalled();
  });

  it('expected ARC = ceil(discounted USD / price): $5 -10% at 0.00001 = 450000 ARC', async () => {
    const { svc, arcPayment } = make();
    await svc.purchaseWithArc(USER, PKG.toHexString(), SIG, 'W');
    expect(arcPayment.verifyAndRedeem).toHaveBeenCalledWith({
      userId: USER,
      signature: SIG,
      senderAddress: 'W',
      expectedAmount: 450_000,
      kind: 'gems',
      subjectId: PKG.toHexString(),
    });
  });

  it('credits gems + bonus once the payment is verified and claimed', async () => {
    const { svc, wallet } = make();
    const out = await svc.purchaseWithArc(USER, PKG.toHexString(), SIG);
    expect(out.gemsCredited).toBe(110);
    expect(wallet.credit).toHaveBeenCalledWith(
      USER,
      'gems',
      110,
      'gem_purchase_arc',
      `gem-arc-${SIG}`,
      expect.objectContaining({ signature: SIG }),
    );
  });

  it('does not credit when verification or the replay claim fails', async () => {
    const verify = jest
      .fn()
      .mockRejectedValue(new BadRequestException('arc.signatureAlreadyUsed'));
    const { svc, wallet } = make({ verify });
    await expect(
      svc.purchaseWithArc(USER, PKG.toHexString(), SIG, 'W'),
    ).rejects.toThrow('arc.signatureAlreadyUsed');
    expect(wallet.credit).not.toHaveBeenCalled();
  });

  it('double submit of the same signature pays out once (second returns 0 gems)', async () => {
    const { svc, wallet } = make({ existingTx: { id: 'tx' } });
    const out = await svc.purchaseWithArc(USER, PKG.toHexString(), SIG, 'W');
    expect(out).toMatchObject({ success: true, gemsCredited: 0 });
    expect(wallet.credit).not.toHaveBeenCalled();
  });

  it('rejects unknown / inactive packages', async () => {
    await expect(
      make({ pkg: null }).svc.purchaseWithArc(
        USER,
        PKG.toHexString(),
        SIG,
        'W',
      ),
    ).rejects.toThrow('gems.packageNotFound');
    await expect(
      make({
        pkg: { _id: PKG, gems: 1, priceUsd: 100, active: false },
      }).svc.purchaseWithArc(USER, PKG.toHexString(), SIG, 'W'),
    ).rejects.toThrow('gems.packageInactive');
  });
});
