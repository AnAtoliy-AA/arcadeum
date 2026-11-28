import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ArcPaymentService } from './arc-payment.service';

jest.mock('../solana.service', () => ({ SolanaService: class {} }));
jest.mock('./solana-pay.service', () => ({ SolanaPayService: class {} }));

const base = {
  userId: 'u1',
  signature: 'sig',
  expectedAmount: 25,
  kind: 'gems' as const,
  subjectId: 'pkg1',
};

function make(verify: unknown, ref: string | null = 'REF') {
  const solana = {
    verifyTransactionDetailed: jest.fn().mockResolvedValue(verify),
  };
  const pay = { referenceFor: jest.fn().mockReturnValue(ref) };
  const registry = { redeem: jest.fn().mockResolvedValue('new') };
  const svc = new ArcPaymentService(
    solana as never,
    pay as never,
    registry as never,
  );
  return { svc, solana, pay, registry };
}

describe('ArcPaymentService.verifyAndRedeem', () => {
  it('verifies against the claimed wallet, then claims the signature', async () => {
    const { svc, solana, registry } = make({ valid: true, reason: 'ok' });
    await svc.verifyAndRedeem({ ...base, senderAddress: 'W' });
    expect(solana.verifyTransactionDetailed).toHaveBeenCalledWith('sig', 25, {
      senderAddress: 'W',
      requiredReference: undefined,
    });
    expect(registry.redeem).toHaveBeenCalledWith('sig', 'u1', 'gems', 'pkg1');
  });

  it('with no wallet (Solana Pay) binds to the user session reference', async () => {
    const { svc, solana } = make({ valid: true, reason: 'ok' });
    await svc.verifyAndRedeem(base);
    expect(solana.verifyTransactionDetailed).toHaveBeenCalledWith('sig', 25, {
      senderAddress: undefined,
      requiredReference: 'REF',
    });
  });

  it("with no wallet and no session of this user, anyone else's deposit is refused", async () => {
    const { svc, solana, registry } = make({ valid: true, reason: 'ok' }, null);
    await expect(svc.verifyAndRedeem(base)).rejects.toThrow(
      new BadRequestException('gems.invalidTransaction'),
    );
    expect(solana.verifyTransactionDetailed).not.toHaveBeenCalled();
    expect(registry.redeem).not.toHaveBeenCalled();
  });

  it.each([
    ['rpc_error', ServiceUnavailableException, 'gems.rpcUnavailable'],
    ['unconfigured', ServiceUnavailableException, 'arc.notConfigured'],
    ['not_found', BadRequestException, 'gems.transactionNotConfirmed'],
    ['amount_too_low', BadRequestException, 'gems.paymentTooLow'],
    ['wrong_mint', BadRequestException, 'gems.invalidTransaction'],
    ['wrong_recipient', BadRequestException, 'gems.invalidTransaction'],
  ])(
    'maps %s to a clear user-facing error and never redeems',
    async (reason, Cls, msg) => {
      const { svc, registry } = make({ valid: false, reason });
      const err = await svc
        .verifyAndRedeem({ ...base, senderAddress: 'W' })
        .catch((e: unknown) => e);
      expect(err).toBeInstanceOf(Cls);
      expect((err as Error).message).toBe(msg);
      expect(registry.redeem).not.toHaveBeenCalled();
    },
  );

  it('uses the shop error namespace for shop purchases', async () => {
    const { svc } = make({ valid: false, reason: 'rpc_error' });
    await expect(
      svc.verifyAndRedeem({ ...base, kind: 'shop', senderAddress: 'W' }),
    ).rejects.toThrow('shop.rpcUnavailable');
  });

  it('propagates a replay conflict from the registry', async () => {
    const { svc, registry } = make({ valid: true, reason: 'ok' });
    registry.redeem.mockRejectedValue(new Error('arc.signatureAlreadyUsed'));
    await expect(
      svc.verifyAndRedeem({ ...base, senderAddress: 'W' }),
    ).rejects.toThrow('arc.signatureAlreadyUsed');
  });
});
