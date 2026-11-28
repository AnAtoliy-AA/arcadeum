import { matchArcTransfer, type MatchContext } from './arc-tx-verifier';
import { ARCADEUM_DECIMALS, toRawAmount } from './arcadeum-token';

const MINT = '7aRVHPcJnsGWBZMNe2igQsLQmQb4LCCtpuiJgxHjpump';
const TREASURY = 'Treasury1111111111111111111111111111111111';
const TREASURY_ATA = 'TreasuryAta11111111111111111111111111111111';
const PAYER = 'Payer11111111111111111111111111111111111111';

function transfer(over: Record<string, unknown> = {}, amountRaw = '25000000') {
  return {
    program: 'spl-token',
    parsed: {
      type: 'transferChecked',
      info: {
        mint: MINT,
        authority: PAYER,
        destination: TREASURY_ATA,
        tokenAmount: { amount: amountRaw, decimals: ARCADEUM_DECIMALS },
        ...over,
      },
    },
  };
}

const tx = (...ixs: unknown[]) => ({
  transaction: { message: { instructions: ixs } },
  meta: { innerInstructions: [] },
});

const ctx = (over: Partial<MatchContext> = {}): MatchContext => ({
  mint: MINT,
  treasury: TREASURY,
  treasuryAtas: new Set([TREASURY_ATA]),
  expectedRaw: toRawAmount(25),
  tolerancePercent: 0,
  tokenProgramIds: ['TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'],
  senderAddress: PAYER,
  ...over,
});

describe('matchArcTransfer at 6 decimals', () => {
  it('accepts the exact amount (25 ARC = 25_000_000 raw)', () => {
    expect(matchArcTransfer(tx(transfer()), ctx())).toEqual({
      valid: true,
      reason: 'ok',
      sender: PAYER,
    });
  });

  it('accepts an overpayment', () => {
    expect(matchArcTransfer(tx(transfer({}, '30000000')), ctx()).valid).toBe(
      true,
    );
  });

  it('rejects an underpayment by one raw unit', () => {
    const r = matchArcTransfer(tx(transfer({}, '24999999')), ctx());
    expect(r).toEqual({ valid: false, reason: 'amount_too_low' });
  });

  it('a 9-decimals reading of the same number is not accepted (decimals_mismatch)', () => {
    const r = matchArcTransfer(
      tx(
        transfer({
          tokenAmount: { amount: '25000000000', decimals: 9 },
        }),
      ),
      ctx(),
    );
    expect(r).toEqual({ valid: false, reason: 'decimals_mismatch' });
  });

  it('rounds fractional expectations in raw units (ceil quotes like 12.3456789)', () => {
    // toRawAmount keeps 6 decimals: 12.345679 ARC
    const raw = toRawAmount(12.3456789).toString();
    expect(raw).toBe('12345679');
    expect(
      matchArcTransfer(
        tx(transfer({}, raw)),
        ctx({ expectedRaw: toRawAmount(12.3456789) }),
      ).valid,
    ).toBe(true);
  });

  describe('tolerance', () => {
    it('accepts up to the configured percent below the quote', () => {
      // 2% of 25_000_000 = 500_000 -> 24_500_000 is the floor
      const c = ctx({ tolerancePercent: 2 });
      expect(matchArcTransfer(tx(transfer({}, '24500000')), c).valid).toBe(
        true,
      );
      expect(matchArcTransfer(tx(transfer({}, '24499999')), c).valid).toBe(
        false,
      );
    });

    it('default tolerance 0 is exact', () => {
      expect(matchArcTransfer(tx(transfer({}, '24999999')), ctx()).valid).toBe(
        false,
      );
    });
  });

  it('rejects the wrong mint', () => {
    const r = matchArcTransfer(tx(transfer({ mint: 'OtherMint' })), ctx());
    expect(r).toEqual({ valid: false, reason: 'wrong_mint' });
  });

  it('rejects a deposit to someone else', () => {
    const r = matchArcTransfer(
      tx(transfer({ destination: 'Stranger' })),
      ctx(),
    );
    expect(r).toEqual({ valid: false, reason: 'wrong_recipient' });
  });

  it('accepts a destination owned by the treasury (non canonical account)', () => {
    const r = matchArcTransfer(
      tx(transfer({ destination: 'Custom', destinationOwner: TREASURY })),
      ctx(),
    );
    expect(r.valid).toBe(true);
  });

  it('rejects when the authority is not the claimed sender', () => {
    const r = matchArcTransfer(tx(transfer({ authority: 'Thief' })), ctx());
    expect(r).toEqual({ valid: false, reason: 'wrong_sender' });
  });

  it('without a claimed sender the payer is read from the transaction', () => {
    const r = matchArcTransfer(
      tx(transfer({ authority: 'AnyPayer' })),
      ctx({ senderAddress: undefined }),
    );
    expect(r).toEqual({ valid: true, reason: 'ok', sender: 'AnyPayer' });
  });

  it('plain transfer (no mint attestation) is never accepted', () => {
    const plain = transfer();
    plain.parsed.type = 'transfer';
    expect(matchArcTransfer(tx(plain), ctx())).toEqual({
      valid: false,
      reason: 'no_transfer',
    });
  });

  it('finds a qualifying transfer inside inner instructions', () => {
    const t = {
      transaction: { message: { instructions: [] } },
      meta: { innerInstructions: [{ instructions: [transfer()] }] },
    };
    expect(matchArcTransfer(t, ctx()).valid).toBe(true);
  });

  it('reports the closest miss when several transfers fail', () => {
    const r = matchArcTransfer(
      tx(transfer({ mint: 'Other' }), transfer({ destination: 'Stranger' })),
      ctx(),
    );
    expect(r.reason).toBe('wrong_recipient');
  });
});
