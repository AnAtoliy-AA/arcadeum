import { PumpFunListenerService } from './pumpfun-listener.service';
import { ConfigService } from '@nestjs/config';
import { TelegramService } from '../telegram/telegram.service';
import { createHash } from 'crypto';

const SELL_DISCRIMINATOR = createHash('sha256')
  .update('global:sell')
  .digest()
  .subarray(0, 8);

jest.mock('@solana/web3.js', () => {
  return {
    PublicKey: jest.fn().mockImplementation((key: string) => ({
      toBase58: () => key,
    })),
    Connection: jest.fn().mockImplementation(() => ({
      getSignaturesForAddress: jest.fn(),
      getTransaction: jest.fn(),
    })),
    LAMPORTS_PER_SOL: 1_000_000_000,
  };
});

describe('PumpFunListenerService', () => {
  let service: PumpFunListenerService;
  let mockTelegram: { sendTransaction: jest.Mock };

  const MINT = '7aRVHPcJnsGWBZMNe2igQsLQmQb4LCCtpuiJgxHjpump';

  beforeEach(() => {
    mockTelegram = { sendTransaction: jest.fn().mockResolvedValue(undefined) };
    const env: Record<string, string> = {
      SOLANA_RPC_URL: 'https://rpc.example.com',
      SOLANA_WS_URL: 'wss://rpc.example.com',
      PUMPFUN_MINT_ADDRESS: MINT,
    };
    const mockConfig = { get: jest.fn((key: string) => env[key]) };

    service = new PumpFunListenerService(
      mockConfig as unknown as ConfigService,
      mockTelegram as unknown as TelegramService,
    );
  });

  describe('constructor', () => {
    it('should throw if PUMPFUN_MINT_ADDRESS is missing', () => {
      const emptyConfig = { get: () => undefined };
      expect(
        () =>
          new PumpFunListenerService(
            emptyConfig as unknown as ConfigService,
            mockTelegram as unknown as TelegramService,
          ),
      ).toThrow('PUMPFUN_MINT_ADDRESS is required');
    });
  });

  describe('parseTransaction', () => {
    const makeAccountKey = (base58: string) => ({
      toBase58: () => base58,
    });

    it('should return null if tx has no meta', () => {
      const result = (
        service as unknown as {
          parseTransaction: (typeof service)['parseTransaction'];
        }
      ).parseTransaction(
        {
          meta: null,
          transaction: {
            message: { staticAccountKeys: [] },
          },
        } as never,
        'sig1',
      );
      expect(result).toBeNull();
    });

    const PUMPFUN_PROGRAM = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';

    it('should detect buy from token balance increase', () => {
      const buyerWallet = 'BuyerWallet1111111111111111111111111111111';
      const result = (
        service as unknown as {
          parseTransaction: (typeof service)['parseTransaction'];
        }
      ).parseTransaction(
        {
          meta: {
            innerInstructions: [],
            preBalances: [1_000_000_000, 500_000_000],
            postBalances: [500_000_000, 1_500_000_000],
            preTokenBalances: [
              {
                accountIndex: 0,
                mint: MINT,
                owner: buyerWallet,
                uiTokenAmount: { amount: '0', decimals: 6 },
              },
            ],
            postTokenBalances: [
              {
                accountIndex: 0,
                mint: MINT,
                owner: buyerWallet,
                uiTokenAmount: { amount: '1000000000', decimals: 6 },
              },
            ],
          },
          transaction: {
            message: {
              staticAccountKeys: [
                makeAccountKey(PUMPFUN_PROGRAM),
                makeAccountKey(buyerWallet),
              ],
            },
          },
        } as never,
        'buy_sig',
      );

      expect(result).not.toBeNull();
      expect(result!.type).toBe('buy');
      expect(result!.wallet).toBe(buyerWallet);
      expect(result!.tokenAmount).toBe(1000);
      expect(result!.signature).toBe('buy_sig');
    });

    it('should detect sell from token balance decrease', () => {
      const sellerWallet = 'SellerWallet111111111111111111111111111111';
      const sellDiscB64 = Buffer.alloc(32);
      Buffer.from(SELL_DISCRIMINATOR).copy(sellDiscB64);
      const result = (
        service as unknown as {
          parseTransaction: (typeof service)['parseTransaction'];
        }
      ).parseTransaction(
        {
          meta: {
            innerInstructions: [
              {
                instructions: [{ data: sellDiscB64.toString('base64') }],
              },
            ],
            preBalances: [500_000_000, 1_000_000_000],
            postBalances: [1_000_000_000, 500_000_000],
            preTokenBalances: [
              {
                accountIndex: 1,
                mint: MINT,
                owner: sellerWallet,
                uiTokenAmount: { amount: '2000000000', decimals: 6 },
              },
            ],
            postTokenBalances: [
              {
                accountIndex: 1,
                mint: MINT,
                owner: sellerWallet,
                uiTokenAmount: { amount: '500000000', decimals: 6 },
              },
            ],
          },
          transaction: {
            message: {
              staticAccountKeys: [
                makeAccountKey(PUMPFUN_PROGRAM),
                makeAccountKey(sellerWallet),
              ],
            },
          },
        } as never,
        'sell_sig',
      );

      expect(result).not.toBeNull();
      expect(result!.type).toBe('sell');
      expect(result!.wallet).toBe(sellerWallet);
      expect(result!.tokenAmount).toBe(1500);
    });

    it('should return null if no token balance change found', () => {
      const result = (
        service as unknown as {
          parseTransaction: (typeof service)['parseTransaction'];
        }
      ).parseTransaction(
        {
          meta: {
            innerInstructions: [],
            preBalances: [1_000_000_000],
            postBalances: [1_000_000_000],
            preTokenBalances: [],
            postTokenBalances: [],
          },
          transaction: {
            message: {
              staticAccountKeys: [makeAccountKey(PUMPFUN_PROGRAM)],
            },
          },
        } as never,
        'no_change_sig',
      );

      expect(result).toBeNull();
    });

    it('should calculate SOL amount from balance difference', () => {
      const wallet = 'TestWallet111111111111111111111111111111111';
      const result = (
        service as unknown as {
          parseTransaction: (typeof service)['parseTransaction'];
        }
      ).parseTransaction(
        {
          meta: {
            innerInstructions: [],
            preBalances: [2_000_000_000, 1_000_000_000],
            postBalances: [1_000_000_000, 2_000_000_000],
            preTokenBalances: [
              {
                accountIndex: 0,
                mint: MINT,
                owner: wallet,
                uiTokenAmount: { amount: '0', decimals: 6 },
              },
            ],
            postTokenBalances: [
              {
                accountIndex: 0,
                mint: MINT,
                owner: wallet,
                uiTokenAmount: { amount: '500000000', decimals: 6 },
              },
            ],
          },
          transaction: {
            message: {
              staticAccountKeys: [
                makeAccountKey(PUMPFUN_PROGRAM),
                makeAccountKey(wallet),
              ],
            },
          },
        } as never,
        'sol_sig',
      );

      expect(result).not.toBeNull();
      expect(result!.solAmount).toBeCloseTo(1.0);
      expect(result!.tokenAmount).toBe(500);
    });
  });
});
