import { ConfigService } from '@nestjs/config';
import { TelegramService } from './telegram.service';

jest.mock('grammy', () => {
  const mockSendMessage = jest.fn().mockResolvedValue({});
  const mockStart = jest.fn();
  const mockStop = jest.fn();
  const mockCommand = jest.fn();

  return {
    Bot: jest.fn().mockImplementation(() => ({
      api: { sendMessage: mockSendMessage },
      command: mockCommand,
      start: mockStart,
      stop: mockStop,
    })),
    __mockSendMessage: mockSendMessage,
    __mockStart: mockStart,
    __mockStop: mockStop,
    __mockCommand: mockCommand,
  };
});

describe('TelegramService', () => {
  let service: TelegramService;
  let mockSendMessage: jest.Mock;

  const BOT_TOKEN = '123456:ABC-TEST';
  const CHAT_ID = '-1001234567890';
  const MINT = '7aRVHPcJnsGWBZMNe2igQsLQmQb4LCCtpuiJgxHjpump';

  beforeEach(() => {
    jest.clearAllMocks();

    const grammyMock = jest.requireMock('grammy');
    mockSendMessage = grammyMock.__mockSendMessage;

    const configGet = jest.fn((key: string) => {
      const env: Record<string, string> = {
        TELEGRAM_BOT_TOKEN: BOT_TOKEN,
        TELEGRAM_CHAT_ID: CHAT_ID,
        PUMPFUN_MINT_ADDRESS: MINT,
      };
      return env[key];
    });

    service = new TelegramService({
      get: configGet,
    } as unknown as ConfigService);
  });

  describe('onModuleInit', () => {
    it('should throw if TELEGRAM_BOT_TOKEN is missing', () => {
      const configGet = jest.fn(() => undefined);
      const svc = new TelegramService({
        get: configGet,
      } as unknown as ConfigService);
      expect(() => svc.onModuleInit()).toThrow(
        'TELEGRAM_BOT_TOKEN is required',
      );
    });

    it('should throw if TELEGRAM_CHAT_ID is missing', () => {
      const configGet = jest.fn((key: string) => {
        if (key === 'TELEGRAM_BOT_TOKEN') return BOT_TOKEN;
        return undefined;
      });
      const svc = new TelegramService({
        get: configGet,
      } as unknown as ConfigService);
      expect(() => svc.onModuleInit()).toThrow('TELEGRAM_CHAT_ID is required');
    });

    it('should initialize successfully with valid config', () => {
      expect(() => service.onModuleInit()).not.toThrow();
    });
  });

  describe('sendTransaction', () => {
    beforeEach(() => {
      service.onModuleInit();
    });

    it('should send buy notification with correct format', async () => {
      await service.sendTransaction({
        type: 'buy',
        wallet: '3xKp9mNq2vL8',
        tokenAmount: 1_250_000,
        solAmount: 0.5,
        signature: 'tx_sig_123',
      });

      expect(mockSendMessage).toHaveBeenCalledTimes(1);
      const call = mockSendMessage.mock.calls[0] as unknown[];
      const chatId = call[0] as string;
      const message = call[1] as string;
      const opts = call[2] as { parse_mode: string };
      expect(chatId).toBe(CHAT_ID);
      expect(opts).toEqual({ parse_mode: 'HTML' });
      expect(message).toContain('BOUGHT');
      expect(message).toContain('3xKp9mNq2vL8');
      expect(message).toContain('1,250,000');
      expect(message).toContain('ARC');
      expect(message).toContain('0.5000');
      expect(message).toContain('SOL');
      expect(message).toContain('solscan.io/tx/tx_sig_123');
      expect(message).toContain('pump.fun/coin/' + MINT);
    });

    it('should send sell notification', async () => {
      await service.sendTransaction({
        type: 'sell',
        wallet: 'Seller11111111',
        tokenAmount: 500_000,
        solAmount: 0.25,
        signature: 'sell_sig_456',
      });

      const message = (mockSendMessage.mock.calls[0] as unknown[])[1] as string;
      expect(message).toContain('SOLD');
      expect(message).toContain('Seller11111111');
    });

    it('should calculate percentage of total supply correctly', async () => {
      await service.sendTransaction({
        type: 'buy',
        wallet: 'Wallet111',
        tokenAmount: 10_000_000,
        solAmount: 0.1,
        signature: 'pct_sig',
      });

      const message = (mockSendMessage.mock.calls[0] as unknown[])[1] as string;
      expect(message).toContain('1.0000%');
    });

    it('should handle small percentage values', async () => {
      await service.sendTransaction({
        type: 'buy',
        wallet: 'Wallet222',
        tokenAmount: 1234,
        solAmount: 0.001,
        signature: 'small_sig',
      });

      const message = (mockSendMessage.mock.calls[0] as unknown[])[1] as string;
      expect(message).toContain('0.0001%');
    });

    it('should log error if sendMessage fails', async () => {
      mockSendMessage.mockRejectedValueOnce(new Error('Telegram API error'));

      await expect(
        service.sendTransaction({
          type: 'buy',
          wallet: 'W1',
          tokenAmount: 100,
          solAmount: 0.01,
          signature: 'err_sig',
        }),
      ).resolves.not.toThrow();
    });
  });
});
