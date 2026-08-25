jest.mock('./lib/solana-keypair', () => ({
  getPlatformKeypair: jest.fn(),
}));

jest.mock('./lib/arcadeum-token', () => ({
  getArcadeumMint: jest
    .fn()
    .mockResolvedValue({ toBase58: () => 'mock-mint-address' }),
  toRawAmount: jest.fn((n: number) => BigInt(Math.round(n * 1e9))),
  fromRawAmount: jest.fn((n: bigint) => Number(n) / 1e9),
  ARCADEUM_DECIMALS: 9,
  TOKEN_PROGRAM_ID: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  TOKEN_2022_PROGRAM_ID: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
  SOLANA_TOKEN_PROGRAM_IDS: ['token-program', 'token-2022-program'],
}));

import { getPlatformKeypair } from './lib/solana-keypair';
import { SolanaService } from './solana.service';
import { ConfigService } from '@nestjs/config';

const mockConnection = {
  getBalance: jest.fn(),
  getLatestBlockhash: jest.fn(),
  sendRawTransaction: jest.fn(),
  confirmTransaction: jest.fn(),
  getTransaction: jest.fn(),
};

const mockPublicKey = (key: string) => ({
  toBase58: () => key,
  equals: (other: { toBase58: () => string }) => other?.toBase58?.() === key,
});

const mockWeb3 = {
  Connection: jest.fn().mockImplementation(() => mockConnection),
  PublicKey: jest.fn().mockImplementation(mockPublicKey),
  LAMPORTS_PER_SOL: 1_000_000_000,
};

const mockSplToken = {
  getAssociatedTokenAddress: jest.fn(),
  getAccount: jest.fn(),
};

const DEFAULT_CONFIG: Record<string, string> = {
  SOLANA_RPC_URL: 'https://api.mainnet-beta.solana.com',
  SOLANA_PRIVATE_KEY:
    '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64]',
  ARCADEUM_MINT_ADDRESS: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  SOLANA_TREASURY_ADDRESS: 'platform-key-123',
};

function makeConfig(overrides: Record<string, string> = {}) {
  const merged = { ...DEFAULT_CONFIG, ...overrides };
  return {
    get: jest.fn((key: string) => merged[key]),
    getOrThrow: jest.fn((key: string) => {
      const val = merged[key];
      if (!val) throw new Error(`Missing config: ${key}`);
      return val;
    }),
  } as unknown as ConfigService;
}

function createService(overrides: Record<string, string> = {}) {
  const svc = new SolanaService(makeConfig(overrides));
  // Inject mocked lazy loaders
  const s = svc as unknown as {
    loadWeb3: () => Promise<typeof mockWeb3>;
    loadSplToken: () => Promise<typeof mockSplToken>;
    getConnection: () => Promise<typeof mockConnection>;
  };
  s.loadWeb3 = jest.fn().mockResolvedValue(mockWeb3);
  s.loadSplToken = jest.fn().mockResolvedValue(mockSplToken);
  s.getConnection = jest.fn().mockResolvedValue(mockConnection);
  return svc;
}

describe('SolanaService', () => {
  let service: SolanaService;
  let keypair: { publicKey: ReturnType<typeof mockPublicKey> };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConnection.getBalance.mockReset();
    mockConnection.getTransaction.mockReset();
    keypair = { publicKey: mockPublicKey('platform-key-123') };
    (getPlatformKeypair as jest.Mock).mockResolvedValue(keypair);
    service = createService();
  });

  describe('getPlatformBalance', () => {
    it('returns SOL + ARCADEUM balances (sums both token programs)', async () => {
      mockConnection.getBalance.mockResolvedValue(2 * 1_000_000_000);
      mockSplToken.getAssociatedTokenAddress.mockResolvedValue(
        mockPublicKey('ata-address'),
      );
      // First token program has an account; the second does not.
      mockSplToken.getAccount
        .mockResolvedValueOnce({ amount: BigInt(100_000_000_000) })
        .mockRejectedValueOnce(new Error('Account not found'));

      const result = await service.getPlatformBalance();

      expect(result.sol).toBe(2);
      expect(result.arcadeum).toBe(100);
      expect(mockConnection.getBalance).toHaveBeenCalled();
    });

    it('handles missing ARCADEUM token account gracefully', async () => {
      mockConnection.getBalance.mockResolvedValue(1_000_000_000);
      mockSplToken.getAssociatedTokenAddress.mockResolvedValue(
        mockPublicKey('ata-address'),
      );
      mockSplToken.getAccount.mockRejectedValue(new Error('Account not found'));

      const result = await service.getPlatformBalance();

      expect(result.sol).toBe(1);
      expect(result.arcadeum).toBe(0);
    });
  });

  describe('getSolPrice', () => {
    it('fetches and caches SOL price', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ solana: { usd: 150.5 } }),
      });
      global.fetch = mockFetch;

      const price = await service.getSolPrice();
      expect(price).toBe(150.5);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const cached = await service.getSolPrice();
      expect(cached).toBe(150.5);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('throws on failed fetch', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 });

      await expect(service.getSolPrice()).rejects.toThrow(
        'Failed to fetch SOL price',
      );
    });
  });
});
