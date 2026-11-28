import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SolanaPayService } from './solana-pay.service';

jest.mock('../solana.service', () => ({ SolanaService: class {} }));
jest.mock('@solana/web3.js', () => {
  let n = 0;
  return {
    Keypair: {
      generate: () => ({ publicKey: { toBase58: () => `Ref${++n}` } }),
    },
  };
});

const MINT = '7aRVHPcJnsGWBZMNe2igQsLQmQb4LCCtpuiJgxHjpump';
const TREASURY = 'Treasury1111';

function make(over: { mint?: string | null; treasury?: string } = {}) {
  const solana = {
    getRuntimeConfig: jest.fn().mockReturnValue({
      mint: over.mint === undefined ? MINT : over.mint,
      treasury: over.treasury ?? TREASURY,
    }),
    findReferenceSignature: jest.fn(),
    verifyTransactionDetailed: jest.fn(),
  };
  const svc = new SolanaPayService({} as never, solana as never);
  return { svc, solana };
}

describe('SolanaPayService', () => {
  afterEach(() => jest.useRealTimers());

  describe('createPaymentRequest', () => {
    it('builds a Solana Pay URL with the configured mint, treasury and a reference', () => {
      const { svc } = make();
      const req = svc.createPaymentRequest('u1', 25, MINT);
      expect(req.recipient).toBe(TREASURY);
      expect(req.solanaPayUrl).toContain(`solana:${TREASURY}?`);
      expect(req.solanaPayUrl).toContain(`spl-token=${MINT}`);
      expect(req.solanaPayUrl).toContain(`reference=${req.reference}`);
      expect(req.sessionId).toHaveLength(16);
    });

    it('each request gets a unique reference and session', () => {
      const { svc } = make();
      const a = svc.createPaymentRequest('u1', 25, MINT);
      const b = svc.createPaymentRequest('u1', 25, MINT);
      expect(a.reference).not.toBe(b.reference);
      expect(a.sessionId).not.toBe(b.sessionId);
    });

    it('refuses a token other than the configured ARC mint', () => {
      expect(() =>
        make().svc.createPaymentRequest('u1', 25, 'OtherMint'),
      ).toThrow(BadRequestException);
    });

    it.each([0, -5, NaN, 2_000_000_000])('refuses amount %p', (amount) => {
      expect(() => make().svc.createPaymentRequest('u1', amount, MINT)).toThrow(
        'arc.invalidAmount',
      );
    });

    it('is unavailable (explicit error) when the mint or treasury is not configured', () => {
      expect(() =>
        make({ mint: null }).svc.createPaymentRequest('u1', 1, MINT),
      ).toThrow(ServiceUnavailableException);
      expect(() =>
        make({ treasury: '' }).svc.createPaymentRequest('u1', 1, MINT),
      ).toThrow(ServiceUnavailableException);
    });
  });

  describe('checkPaymentStatus', () => {
    it('pending until a transaction references the session', async () => {
      const { svc, solana } = make();
      const { sessionId } = svc.createPaymentRequest('u1', 25, MINT);
      solana.findReferenceSignature.mockResolvedValue(null);
      expect(await svc.checkPaymentStatus('u1', sessionId)).toEqual({
        status: 'pending',
      });
    });

    it('confirmed only for a verified deposit carrying the reference', async () => {
      const { svc, solana } = make();
      const req = svc.createPaymentRequest('u1', 25, MINT);
      solana.findReferenceSignature.mockResolvedValue({
        signature: 'S',
        failed: false,
      });
      solana.verifyTransactionDetailed.mockResolvedValue({
        valid: true,
        reason: 'ok',
      });

      const status = await svc.checkPaymentStatus('u1', req.sessionId);

      expect(status).toEqual({ status: 'confirmed', signature: 'S' });
      expect(solana.verifyTransactionDetailed).toHaveBeenCalledWith('S', 25, {
        requiredReference: req.reference,
      });
      // exposes the binding the purchase endpoints rely on
      expect(svc.referenceFor('u1', 'S')).toBe(req.reference);
      expect(svc.referenceFor('u2', 'S')).toBeNull();
    });

    it('does not re-hit the chain once confirmed (idempotent polling)', async () => {
      const { svc, solana } = make();
      const req = svc.createPaymentRequest('u1', 25, MINT);
      solana.findReferenceSignature.mockResolvedValue({
        signature: 'S',
        failed: false,
      });
      solana.verifyTransactionDetailed.mockResolvedValue({
        valid: true,
        reason: 'ok',
      });
      await svc.checkPaymentStatus('u1', req.sessionId);
      await svc.checkPaymentStatus('u1', req.sessionId);
      expect(solana.findReferenceSignature).toHaveBeenCalledTimes(1);
    });

    it('failed when the referenced transaction errored on chain', async () => {
      const { svc, solana } = make();
      const req = svc.createPaymentRequest('u1', 25, MINT);
      solana.findReferenceSignature.mockResolvedValue({
        signature: 'S',
        failed: true,
      });
      expect(await svc.checkPaymentStatus('u1', req.sessionId)).toEqual({
        status: 'failed',
        reason: 'tx_failed',
      });
    });

    it('failed (with the reason) when a payment is too low or the wrong token', async () => {
      const { svc, solana } = make();
      const req = svc.createPaymentRequest('u1', 25, MINT);
      solana.findReferenceSignature.mockResolvedValue({
        signature: 'S',
        failed: false,
      });
      solana.verifyTransactionDetailed.mockResolvedValue({
        valid: false,
        reason: 'amount_too_low',
      });
      expect(await svc.checkPaymentStatus('u1', req.sessionId)).toEqual({
        status: 'failed',
        reason: 'amount_too_low',
      });
    });

    it('stays pending through an RPC blip instead of failing the payment', async () => {
      const { svc, solana } = make();
      const req = svc.createPaymentRequest('u1', 25, MINT);
      solana.findReferenceSignature.mockRejectedValue(new Error('429'));
      expect((await svc.checkPaymentStatus('u1', req.sessionId)).status).toBe(
        'pending',
      );
    });

    it("another user cannot read or confirm someone else's session", async () => {
      const { svc, solana } = make();
      const req = svc.createPaymentRequest('u1', 25, MINT);
      expect(await svc.checkPaymentStatus('u2', req.sessionId)).toEqual({
        status: 'expired',
      });
      expect(solana.findReferenceSignature).not.toHaveBeenCalled();
    });

    it('unknown session is expired', async () => {
      expect(await make().svc.checkPaymentStatus('u1', 'nope')).toEqual({
        status: 'expired',
      });
    });

    it('expires after the window, but a late payment is still confirmed (flagged late)', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00Z'));
      const { svc, solana } = make();
      const req = svc.createPaymentRequest('u1', 25, MINT);
      jest.setSystemTime(new Date('2026-01-01T00:20:00Z'));

      solana.findReferenceSignature.mockResolvedValue(null);
      expect((await svc.checkPaymentStatus('u1', req.sessionId)).status).toBe(
        'expired',
      );

      solana.findReferenceSignature.mockResolvedValue({
        signature: 'LATE',
        failed: false,
      });
      solana.verifyTransactionDetailed.mockResolvedValue({
        valid: true,
        reason: 'ok',
      });
      expect(await svc.checkPaymentStatus('u1', req.sessionId)).toEqual({
        status: 'confirmed',
        signature: 'LATE',
        late: true,
      });
    });
  });

  it('registerCallback only works for the owner of an unconfirmed session', () => {
    const { svc } = make();
    const req = svc.createPaymentRequest('u1', 25, MINT);
    expect(svc.registerCallback('u1', req.sessionId, () => undefined)).toBe(
      true,
    );
    expect(svc.registerCallback('u2', req.sessionId, () => undefined)).toBe(
      false,
    );
    expect(svc.registerCallback('u1', 'missing', () => undefined)).toBe(false);
  });
});
