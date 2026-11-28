jest.mock('./lib/solana-keypair', () => ({ getPlatformKeypair: jest.fn() }));

import { ConfigService } from '@nestjs/config';
import { getPlatformKeypair } from './lib/solana-keypair';
import { SolanaService } from './solana.service';
import { ARCADEUM_DECIMALS } from './lib/arcadeum-token';

const MINT = '7aRVHPcJnsGWBZMNe2igQsLQmQb4LCCtpuiJgxHjpump';
const TREASURY = 'Treasury11111111111111111111111111111111';
const ATA = 'TreasuryAta1111111111111111111111111111111';
const PAYER = 'Payer111111111111111111111111111111111111';
const REF = 'Reference111111111111111111111111111111111';
const SIG = 'sig';

const pk = (key: string) => ({
  toBase58: () => key,
  equals: (o: { toBase58: () => string }) => o.toBase58() === key,
});

const connection = { getParsedTransaction: jest.fn() };
const web3 = {
  PublicKey: jest.fn().mockImplementation(pk),
  LAMPORTS_PER_SOL: 1e9,
};
const spl = { getAssociatedTokenAddress: jest.fn(), getAccount: jest.fn() };

function transfer(over: Record<string, unknown> = {}, amount = '25000000') {
  return {
    program: 'spl-token',
    parsed: {
      type: 'transferChecked',
      info: {
        mint: MINT,
        authority: PAYER,
        destination: ATA,
        tokenAmount: { amount, decimals: ARCADEUM_DECIMALS },
        ...over,
      },
    },
  };
}

function parsedTx(over: Record<string, unknown> = {}) {
  return {
    blockTime: Math.floor(Date.now() / 1000) - 60,
    meta: { err: null, innerInstructions: [] },
    transaction: {
      message: {
        accountKeys: [{ pubkey: pk(PAYER) }, { pubkey: pk(REF) }],
        instructions: [transfer()],
      },
    },
    ...over,
  };
}

function make(env: Record<string, string> = {}) {
  const merged: Record<string, string> = {
    ARCADEUM_MINT_ADDRESS: MINT,
    SOLANA_TREASURY_ADDRESS: TREASURY,
    SOLANA_RPC_URL: 'https://rpc.example',
    ...env,
  };
  const svc = new SolanaService({
    get: (k: string) => merged[k],
  } as unknown as ConfigService);
  const s = svc as unknown as Record<string, unknown>;
  s.loadWeb3 = jest.fn().mockResolvedValue(web3);
  s.loadSplToken = jest.fn().mockResolvedValue(spl);
  s.getConnection = jest.fn().mockResolvedValue(connection);
  return svc;
}

describe('SolanaService.verifyTransactionDetailed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getPlatformKeypair as jest.Mock).mockResolvedValue({
      publicKey: pk(TREASURY),
    });
    spl.getAssociatedTokenAddress.mockResolvedValue(pk(ATA));
    connection.getParsedTransaction.mockResolvedValue(parsedTx());
  });

  it('accepts a correct 25 ARC deposit and returns the payer', async () => {
    const r = await make().verifyTransactionDetailed(SIG, 25, {
      senderAddress: PAYER,
    });
    expect(r).toEqual({ valid: true, reason: 'ok', sender: PAYER });
  });

  it('boolean wrapper agrees', async () => {
    expect(await make().verifyTransaction(SIG, 25, PAYER)).toBe(true);
    expect(await make().verifyTransaction(SIG, 26, PAYER)).toBe(false);
  });

  it('underpay is rejected, overpay accepted', async () => {
    connection.getParsedTransaction.mockResolvedValue(
      parsedTx({
        transaction: {
          message: {
            accountKeys: [],
            instructions: [transfer({}, '24999999')],
          },
        },
      }),
    );
    expect((await make().verifyTransactionDetailed(SIG, 25)).reason).toBe(
      'amount_too_low',
    );
    expect((await make().verifyTransactionDetailed(SIG, 24.9)).valid).toBe(
      true,
    );
  });

  it('honours ARC_PAYMENT_TOLERANCE_PERCENT', async () => {
    connection.getParsedTransaction.mockResolvedValue(
      parsedTx({
        transaction: {
          message: {
            accountKeys: [],
            instructions: [transfer({}, '24500000')],
          },
        },
      }),
    );
    const svc = make({ ARC_PAYMENT_TOLERANCE_PERCENT: '2' });
    expect((await svc.verifyTransactionDetailed(SIG, 25)).valid).toBe(true);
  });

  it('wrong mint', async () => {
    connection.getParsedTransaction.mockResolvedValue(
      parsedTx({
        transaction: {
          message: {
            accountKeys: [],
            instructions: [transfer({ mint: 'Other' })],
          },
        },
      }),
    );
    expect((await make().verifyTransactionDetailed(SIG, 25)).reason).toBe(
      'wrong_mint',
    );
  });

  it('wrong recipient', async () => {
    connection.getParsedTransaction.mockResolvedValue(
      parsedTx({
        transaction: {
          message: {
            accountKeys: [],
            instructions: [transfer({ destination: 'Stranger' })],
          },
        },
      }),
    );
    expect((await make().verifyTransactionDetailed(SIG, 25)).reason).toBe(
      'wrong_recipient',
    );
  });

  it('wrong sender when a wallet is claimed', async () => {
    const r = await make().verifyTransactionDetailed(SIG, 25, {
      senderAddress: 'Someone',
    });
    expect(r.reason).toBe('wrong_sender');
  });

  it('unconfirmed / unknown signature is not_found (retry later), not invalid', async () => {
    connection.getParsedTransaction.mockResolvedValue(null);
    expect((await make().verifyTransactionDetailed(SIG, 25)).reason).toBe(
      'not_found',
    );
  });

  it('a failed on-chain transaction is rejected', async () => {
    connection.getParsedTransaction.mockResolvedValue(
      parsedTx({ meta: { err: { InstructionError: [0, 'x'] } } }),
    );
    expect((await make().verifyTransactionDetailed(SIG, 25)).reason).toBe(
      'tx_failed',
    );
  });

  it('an old deposit cannot be replayed after the max age', async () => {
    connection.getParsedTransaction.mockResolvedValue(
      parsedTx({ blockTime: Math.floor(Date.now() / 1000) - 3600 }),
    );
    expect((await make().verifyTransactionDetailed(SIG, 25)).reason).toBe(
      'too_old',
    );
    // 0 disables the window
    const svc = make({ ARC_TX_MAX_AGE_SECONDS: '0' });
    expect((await svc.verifyTransactionDetailed(SIG, 25)).valid).toBe(true);
  });

  it('requires the Solana Pay reference when one is expected', async () => {
    expect(
      (
        await make().verifyTransactionDetailed(SIG, 25, {
          requiredReference: REF,
        })
      ).valid,
    ).toBe(true);
    expect(
      (
        await make().verifyTransactionDetailed(SIG, 25, {
          requiredReference: 'OtherRef',
        })
      ).reason,
    ).toBe('reference_missing');
  });

  it('missing/invalid mint refuses to verify (no System Program fallback)', async () => {
    const svc = make({ ARCADEUM_MINT_ADDRESS: 'your_token_mint_address_here' });
    const r = await svc.verifyTransactionDetailed(SIG, 25);
    expect(r.reason).toBe('unconfigured');
    expect(connection.getParsedTransaction).not.toHaveBeenCalled();
  });

  it('treasury env that differs from the keypair fails closed', async () => {
    const svc = make({ SOLANA_TREASURY_ADDRESS: 'SomeOtherWallet' });
    expect((await svc.verifyTransactionDetailed(SIG, 25)).reason).toBe(
      'treasury_mismatch',
    );
  });

  it('an RPC outage is rpc_error (retry), not an invalid payment', async () => {
    connection.getParsedTransaction.mockRejectedValue(new Error('invalid'));
    expect((await make().verifyTransactionDetailed(SIG, 25)).reason).toBe(
      'rpc_error',
    );
  });

  it('retries rate limited RPC calls and still verifies', async () => {
    jest.useFakeTimers();
    connection.getParsedTransaction
      .mockRejectedValueOnce(new Error('429 Too Many Requests'))
      .mockResolvedValue(parsedTx());
    const p = make().verifyTransactionDetailed(SIG, 25);
    await jest.advanceTimersByTimeAsync(1_000);
    expect((await p).valid).toBe(true);
    jest.useRealTimers();
  });

  describe('replay protection helpers', () => {
    it('the mint config issue is surfaced for ops', () => {
      const svc = make({ ARCADEUM_MINT_ADDRESS: '' });
      expect(svc.isArcConfigured()).toBe(false);
      expect(svc.getRuntimeConfig().issues.join()).toMatch(
        /ARCADEUM_MINT_ADDRESS/,
      );
    });
  });
});
