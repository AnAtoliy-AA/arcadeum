import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { GemConversionService } from './gem-conversion.service';
import { WalletService } from '../../wallet/wallet.service';
import { InsufficientFundsException } from '../../wallet/exceptions/insufficient-funds.exception';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';
const VALID_UUID_2 = '223e4567-e89b-12d3-a456-426614174000';

const makeDuplicateKeyError = () => {
  const err = new Error('E11000 duplicate key error') as Error & {
    code: number;
    keyPattern: Record<string, number>;
  };
  err.code = 11000;
  err.keyPattern = { idempotencyKey: 1 };
  return err;
};

const buildWallet = () => ({
  debit: jest.fn(),
  credit: jest.fn(),
  getBalance: jest.fn().mockResolvedValue({ coins: 0, gems: 0 }),
  findByIdempotencyKey: jest.fn().mockResolvedValue(null),
  emitAfterCommit: jest.fn(),
});

const buildConnection = () => {
  const session = {
    withTransaction: jest
      .fn()
      .mockImplementation(async (fn: () => Promise<void>) => {
        await fn();
      }),
    endSession: jest.fn().mockResolvedValue(undefined),
  };
  return {
    startSession: jest.fn().mockResolvedValue(session),
    _session: session,
  };
};

const buildConfig = (rate?: string) => ({
  get: jest.fn((key: string) => {
    if (key === 'GEM_TO_COIN_RATE') return rate;
    return undefined;
  }),
});

const buildModule = async (configValue?: string) => {
  const wallet = buildWallet();
  const conn = buildConnection();
  const config = buildConfig(configValue);

  const moduleRef = await Test.createTestingModule({
    providers: [
      GemConversionService,
      { provide: WalletService, useValue: wallet },
      { provide: getConnectionToken(), useValue: conn },
      { provide: ConfigService, useValue: config },
    ],
  }).compile();

  const service = moduleRef.get(GemConversionService);
  return { service, wallet, conn, config };
};

describe('GemConversionService', () => {
  describe('getRate', () => {
    it('defaults to 100 when env var is not set', async () => {
      const { service } = await buildModule(undefined);
      expect(service.getRate()).toBe(100);
    });

    it('uses custom rate from env when valid', async () => {
      const { service } = await buildModule('200');
      expect(service.getRate()).toBe(200);
    });

    it('falls back to 100 when env var is invalid (non-integer)', async () => {
      const { service } = await buildModule('abc');
      expect(service.getRate()).toBe(100);
    });

    it('falls back to 100 when env var is zero', async () => {
      const { service } = await buildModule('0');
      expect(service.getRate()).toBe(100);
    });

    it('falls back to 100 when env var is negative', async () => {
      const { service } = await buildModule('-5');
      expect(service.getRate()).toBe(100);
    });
  });

  describe('convertGemsToCoins — input validation', () => {
    let service: GemConversionService;

    beforeEach(async () => {
      ({ service } = await buildModule());
    });

    it('throws 400 when gems is zero', async () => {
      await expect(
        service.convertGemsToCoins('user1', 0, VALID_UUID),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws 400 when gems is negative', async () => {
      await expect(
        service.convertGemsToCoins('user1', -1, VALID_UUID),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws 400 when gems is a float', async () => {
      await expect(
        service.convertGemsToCoins('user1', 1.5, VALID_UUID),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws 400 when gems exceeds 1_000_000', async () => {
      await expect(
        service.convertGemsToCoins('user1', 1_000_001, VALID_UUID),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws 400 when conversionId is not a valid UUID', async () => {
      await expect(
        service.convertGemsToCoins('user1', 100, 'not-a-uuid'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws 400 when conversionId is empty', async () => {
      await expect(
        service.convertGemsToCoins('user1', 100, ''),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('convertGemsToCoins — cap validation', () => {
    it('throws 400 when computed coins exceed MAX_TRANSACTION_AMOUNT', async () => {
      // rate=100 * 10001 = 1_000_100 > 1_000_000
      const { service } = await buildModule('100');
      await expect(
        service.convertGemsToCoins('user1', 10_001, VALID_UUID),
      ).rejects.toThrow(BadRequestException);
    });

    it('allows exactly MAX_TRANSACTION_AMOUNT coins', async () => {
      // rate=100, gems=10_000, coins=1_000_000 which equals MAX exactly (not >)
      const { service, wallet } = await buildModule('100');
      wallet.debit.mockResolvedValue({});
      wallet.credit.mockResolvedValue({});
      wallet.getBalance.mockResolvedValue({ coins: 1_000_000, gems: 0 });

      const result = await service.convertGemsToCoins(
        'user1',
        10_000,
        VALID_UUID,
      );
      expect(result.coinsCredited).toBe(1_000_000);
    });
  });

  describe('convertGemsToCoins — happy path', () => {
    it('calls debit then credit with correct args and returns result', async () => {
      const userId = 'user-abc';
      const gems = 500;
      const { service, wallet } = await buildModule('100');
      wallet.debit.mockResolvedValue({});
      wallet.credit.mockResolvedValue({});
      wallet.getBalance.mockResolvedValue({ coins: 50_000, gems: 100 });

      const result = await service.convertGemsToCoins(userId, gems, VALID_UUID);

      expect(wallet.debit).toHaveBeenCalledWith(
        userId,
        'gems',
        500,
        'gem_to_coin_conversion_debit',
        `gem-to-coin-${VALID_UUID}-debit`,
        { conversionId: VALID_UUID, rate: 100 },
        expect.anything(),
      );
      expect(wallet.credit).toHaveBeenCalledWith(
        userId,
        'coins',
        50_000,
        'gem_to_coin_conversion_credit',
        `gem-to-coin-${VALID_UUID}-credit`,
        { conversionId: VALID_UUID, rate: 100 },
        expect.anything(),
      );
      expect(result).toMatchObject({
        gemsDebited: 500,
        coinsCredited: 50_000,
        rate: 100,
        newBalance: { coins: 50_000, gems: 100 },
      });
    });

    it('emits balance update after successful conversion', async () => {
      const { service, wallet } = await buildModule();
      wallet.debit.mockResolvedValue({});
      wallet.credit.mockResolvedValue({});
      const balance = { coins: 100, gems: 0 };
      wallet.getBalance.mockResolvedValue(balance);

      await service.convertGemsToCoins('user1', 1, VALID_UUID);

      expect(wallet.emitAfterCommit).toHaveBeenCalledWith('user1', balance);
    });

    it('uses custom rate from env: GEM_TO_COIN_RATE=200 produces coins = gems * 200', async () => {
      const { service, wallet } = await buildModule('200');
      wallet.debit.mockResolvedValue({});
      wallet.credit.mockResolvedValue({});
      wallet.getBalance.mockResolvedValue({ coins: 200, gems: 0 });

      const result = await service.convertGemsToCoins('user1', 1, VALID_UUID);

      expect(result.coinsCredited).toBe(200);
      expect(result.rate).toBe(200);
      expect(wallet.credit).toHaveBeenCalledWith(
        'user1',
        'coins',
        200,
        'gem_to_coin_conversion_credit',
        expect.any(String),
        expect.any(Object),
        expect.anything(),
      );
    });
  });

  describe('convertGemsToCoins — insufficient funds', () => {
    it('throws InsufficientFundsException when wallet debit fails, no coin credit', async () => {
      const { service, wallet } = await buildModule();
      const insufficientErr = new InsufficientFundsException('gems', 100, 0);
      wallet.debit.mockRejectedValue(insufficientErr);

      await expect(
        service.convertGemsToCoins('user1', 100, VALID_UUID),
      ).rejects.toBeInstanceOf(InsufficientFundsException);

      expect(wallet.credit).not.toHaveBeenCalled();
    });
  });

  describe('convertGemsToCoins — idempotency', () => {
    it('treats duplicate-key error as success when both prior rows exist', async () => {
      const { service, wallet, conn } = await buildModule();
      const dupErr = makeDuplicateKeyError();

      // withTransaction throws the dup-key error
      conn._session.withTransaction.mockRejectedValue(dupErr);

      // Both idempotency keys exist
      const debitTx = { id: 'tx-debit' };
      const creditTx = { id: 'tx-credit' };
      wallet.findByIdempotencyKey.mockImplementation((key: string) => {
        if (key.endsWith('-debit')) return Promise.resolve(debitTx);
        if (key.endsWith('-credit')) return Promise.resolve(creditTx);
        return Promise.resolve(null);
      });
      wallet.getBalance.mockResolvedValue({ coins: 100, gems: 0 });

      const result = await service.convertGemsToCoins('user1', 1, VALID_UUID);

      expect(result.coinsCredited).toBe(1 * 100);
      expect(result.gemsDebited).toBe(1);
    });

    it('re-throws duplicate-key error when only debit row exists (partial state)', async () => {
      const { service, wallet, conn } = await buildModule();
      const dupErr = makeDuplicateKeyError();
      conn._session.withTransaction.mockRejectedValue(dupErr);

      // Only debit row exists, no credit row
      wallet.findByIdempotencyKey.mockImplementation((key: string) => {
        if (key.endsWith('-debit')) return Promise.resolve({ id: 'tx-debit' });
        return Promise.resolve(null);
      });

      await expect(
        service.convertGemsToCoins('user1', 1, VALID_UUID),
      ).rejects.toThrow();
    });

    it('re-throws duplicate-key error when neither row exists', async () => {
      const { service, wallet, conn } = await buildModule();
      const dupErr = makeDuplicateKeyError();
      conn._session.withTransaction.mockRejectedValue(dupErr);
      wallet.findByIdempotencyKey.mockResolvedValue(null);

      await expect(
        service.convertGemsToCoins('user1', 1, VALID_UUID),
      ).rejects.toThrow();
    });

    it('handles two different conversionIds independently without interference', async () => {
      const { service, wallet } = await buildModule();
      wallet.debit.mockResolvedValue({});
      wallet.credit.mockResolvedValue({});
      wallet.getBalance.mockResolvedValue({ coins: 100, gems: 0 });

      await service.convertGemsToCoins('user1', 1, VALID_UUID);
      await service.convertGemsToCoins('user1', 1, VALID_UUID_2);

      expect(wallet.debit).toHaveBeenCalledTimes(2);
      expect(wallet.credit).toHaveBeenCalledTimes(2);
    });
  });
});
