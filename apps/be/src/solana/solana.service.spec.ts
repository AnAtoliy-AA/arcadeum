jest.mock('@solana/web3.js', () => {
  const mockKeypair = {
    publicKey: { toBase58: () => 'mock-pubkey', equals: () => true },
    signTransaction: jest.fn(),
  };
  return {
    Connection: jest.fn().mockImplementation(() => ({
      getBalance: jest.fn(),
      getLatestBlockhash: jest.fn(),
      sendRawTransaction: jest.fn(),
      confirmTransaction: jest.fn(),
    })),
    PublicKey: jest.fn().mockImplementation((key: string) => ({
      toBase58: () => key,
      equals: (other: { toBase58: () => string }) =>
        other?.toBase58?.() === key,
    })),
    Keypair: {
      generate: jest.fn().mockReturnValue(mockKeypair),
    },
    Transaction: jest.fn().mockImplementation(() => ({
      add: jest.fn().mockReturnThis(),
      sign: jest.fn(),
      serialize: jest.fn().mockReturnValue(new Uint8Array()),
      recentBlockhash: '',
      lastValidBlockHeight: 0,
      feePayer: null,
    })),
    SystemProgram: {
      transfer: jest.fn().mockReturnValue({}),
    },
    LAMPORTS_PER_SOL: 1_000_000_000,
  };
});

jest.mock('@solana/spl-token', () => ({
  createTransferInstruction: jest.fn(),
  getAssociatedTokenAddress: jest.fn(),
  getAccount: jest.fn(),
}));

jest.mock('./lib/solana-keypair', () => ({
  getPlatformKeypair: jest.fn(),
}));

jest.mock('./lib/arcadeum-token', () => ({
  getArcadeumMint: jest.fn().mockReturnValue({ toBase58: () => 'mock-mint-address' }),
  toRawAmount: jest.fn((n: number) => BigInt(Math.round(n * 1e9))),
  fromRawAmount: jest.fn((n: bigint) => Number(n) / 1e9),
  ARCADEUM_DECIMALS: 9,
}));

import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  getAccount,
} from '@solana/spl-token';
import { getPlatformKeypair } from './lib/solana-keypair';
import { toRawAmount } from './lib/arcadeum-token';
import { SolanaService } from './solana.service';
import { ConfigService } from '@nestjs/config';

const DEFAULT_CONFIG: Record<string, string> = {
  SOLANA_RPC_URL: 'https://api.mainnet-beta.solana.com',
  SOLANA_PRIVATE_KEY: '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64]',
  ARCADEUM_MINT_ADDRESS: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
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

describe('SolanaService', () => {
  let service: SolanaService;
  let connection: InstanceType<typeof Connection>;
  let keypair: { publicKey: ReturnType<typeof PublicKey> };

  beforeEach(() => {
    jest.clearAllMocks();
    keypair = { publicKey: new PublicKey('platform-key-123') };
    (getPlatformKeypair as jest.Mock).mockReturnValue(keypair);

    service = new SolanaService(makeConfig());
    connection = (service as unknown as { connection: InstanceType<typeof Connection> }).connection;
  });

  describe('getPlatformBalance', () => {
    it('returns SOL + ARCADEUM balances', async () => {
      (connection.getBalance as jest.Mock).mockResolvedValue(2 * LAMPORTS_PER_SOL);
      const ata = PublicKey.default ?? new PublicKey('ata-address');
      (getAssociatedTokenAddress as jest.Mock).mockResolvedValue(ata);
      (getAccount as jest.Mock).mockResolvedValue({
        amount: toRawAmount(100),
      });

      const result = await service.getPlatformBalance();

      expect(result.sol).toBe(2);
      expect(result.arcadeum).toBe(100);
      expect(connection.getBalance).toHaveBeenCalledWith(keypair.publicKey);
    });

    it('handles missing ARCADEUM token account gracefully', async () => {
      (connection.getBalance as jest.Mock).mockResolvedValue(LAMPORTS_PER_SOL);
      (getAssociatedTokenAddress as jest.Mock).mockResolvedValue(
        new PublicKey('ata-address'),
      );
      (getAccount as jest.Mock).mockRejectedValue(new Error('Account not found'));

      const result = await service.getPlatformBalance();

      expect(result.sol).toBe(1);
      expect(result.arcadeum).toBe(0);
    });
  });

  describe('transferArcadeum', () => {
    it('builds and sends a transaction correctly', async () => {
      const recipient = new PublicKey('recipient-key');
      const signature = 'mock-signature-arc';

      (getAssociatedTokenAddress as jest.Mock)
        .mockResolvedValue(new PublicKey('ata-1'))
        .mockResolvedValueOnce(new PublicKey('ata-from'))
        .mockResolvedValueOnce(new PublicKey('ata-to'));

      const mockConn = connection as unknown as {
        getLatestBlockhash: jest.Mock;
        sendRawTransaction: jest.Mock;
        confirmTransaction: jest.Mock;
      };
      mockConn.getLatestBlockhash.mockResolvedValue({
        blockhash: 'block123',
        lastValidBlockHeight: 42,
      });
      mockConn.sendRawTransaction.mockResolvedValue(signature);
      mockConn.confirmTransaction.mockResolvedValue({});

      const result = await service.transferArcadeum(recipient.toBase58(), 50);

      expect(result).toBe(signature);
      expect(mockConn.sendRawTransaction).toHaveBeenCalled();
      expect(mockConn.confirmTransaction).toHaveBeenCalled();
    });

    it('throws on invalid PublicKey', async () => {
      (getAssociatedTokenAddress as jest.Mock).mockRejectedValue(
        new Error('Invalid public key'),
      );

      await expect(
        service.transferArcadeum('not-a-valid-key', 10),
      ).rejects.toThrow();
    });
  });

  describe('transferSol', () => {
    it('builds and sends a SOL transfer correctly', async () => {
      const recipient = new PublicKey('recipient-key');
      const signature = 'mock-signature-sol';
      const lamports = 1_000_000;

      const mockConn = connection as unknown as {
        getLatestBlockhash: jest.Mock;
        sendRawTransaction: jest.Mock;
        confirmTransaction: jest.Mock;
      };
      mockConn.getLatestBlockhash.mockResolvedValue({
        blockhash: 'block456',
        lastValidBlockHeight: 100,
      });
      mockConn.sendRawTransaction.mockResolvedValue(signature);
      mockConn.confirmTransaction.mockResolvedValue({});

      const result = await service.transferSol(recipient.toBase58(), lamports);

      expect(result).toBe(signature);
      expect(mockConn.sendRawTransaction).toHaveBeenCalled();
      expect(mockConn.confirmTransaction).toHaveBeenCalled();
    });

    it('throws on invalid PublicKey', async () => {
      await expect(
        service.transferSol('not-a-valid-key', 1_000_000),
      ).rejects.toThrow();
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
