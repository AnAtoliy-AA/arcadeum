import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot, type Context } from 'grammy';

interface TransactionData {
  type: 'buy' | 'sell';
  wallet: string;
  tokenAmount: number;
  solAmount: number;
  signature: string;
}

interface QueuedMessage {
  message: string;
  retries: number;
}

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private bot!: Bot;
  private chatId!: string;
  private mintAddress!: string;
  private totalSupply: number;
  private readonly maxRetries = 3;
  private retryQueue: QueuedMessage[] = [];
  private retryTimer: ReturnType<typeof setInterval> | null = null;
  private rateLimitedUntil = 0;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is required');
    }

    this.chatId = this.config.get<string>('TELEGRAM_CHAT_ID') ?? '';
    if (!this.chatId) {
      throw new Error('TELEGRAM_CHAT_ID is required');
    }

    this.mintAddress = this.config.get<string>('PUMPFUN_MINT_ADDRESS') ?? '';
    this.totalSupply =
      this.config.get<number>('TOKEN_TOTAL_SUPPLY') ?? 1_000_000_000;

    this.bot = new Bot(token);
    this.registerCommands();
    this.retryTimer = setInterval(() => void this.flushRetryQueue(), 30_000);
    this.logger.log('Telegram bot initialized');
  }

  async onModuleDestroy() {
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
      this.retryTimer = null;
    }
    await this.bot.stop();
  }

  private registerCommands() {
    this.bot.command('start', (ctx: Context) =>
      ctx.reply(
        'PumpFun Transaction Monitor is active.\n' +
          `Monitoring: ${this.mintAddress}\n` +
          'You will receive buy/sell notifications in this chat.',
      ),
    );

    this.bot.command('status', (ctx: Context) =>
      ctx.reply(
        `Monitoring: ${this.mintAddress}\n` +
          `Chat ID: ${this.chatId}\n` +
          `Token supply: ${this.totalSupply.toLocaleString('en-US')}\n` +
          'Status: Active',
      ),
    );

    this.bot.command('help', (ctx: Context) =>
      ctx.reply(
        'Available commands:\n' +
          '/start - Welcome message\n' +
          '/status - Monitor status\n' +
          '/help - Show this message',
      ),
    );

    void this.bot.start({
      onStart: () => this.logger.log('Bot polling started'),
    });
  }

  async sendTransaction(tx: TransactionData) {
    const emoji = tx.type === 'buy' ? '🟢' : '🔴';
    const action = tx.type === 'buy' ? 'BOUGHT' : 'SOLD';
    const pct = ((tx.tokenAmount / this.totalSupply) * 100).toFixed(4);

    const message =
      `${emoji} <b>${action}</b>\n\n` +
      `<code>${tx.wallet}</code>\n` +
      `<b>${tx.tokenAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}</b> ARC (${pct}%)\n` +
      `<b>${tx.solAmount.toFixed(4)}</b> SOL\n\n` +
      `<a href="https://solscan.io/tx/${tx.signature}">Solscan</a> | <a href="https://pump.fun/coin/${this.mintAddress}">PumpFun</a>`;

    await this.sendMessage(message);
  }

  private async sendMessage(message: string): Promise<void> {
    try {
      await this.waitForRateLimit();
      await this.bot.api.sendMessage(this.chatId, message, {
        parse_mode: 'HTML',
      });
      this.logger.log('Sent notification');
    } catch (err) {
      const error = err as { error_code?: number; message?: string };
      if (error.error_code === 429) {
        const retryAfter = this.parseRetryAfter(error.message ?? '');
        this.rateLimitedUntil = Date.now() + retryAfter * 1000;
        this.logger.warn(`Rate limited, waiting ${retryAfter}s`);
        this.enqueueMessage(message);
      } else {
        this.logger.error(`Failed to send Telegram message: ${err}`);
        this.enqueueMessage(message);
      }
    }
  }

  private parseRetryAfter(message: string): number {
    const match = message.match(/retry after (\d+)/i);
    return match ? parseInt(match[1], 10) : 30;
  }

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    if (now < this.rateLimitedUntil) {
      const waitMs = this.rateLimitedUntil - now;
      this.logger.log(`Waiting ${Math.ceil(waitMs / 1000)}s for rate limit`);
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }

  private enqueueMessage(message: string): void {
    if (this.retryQueue.length >= 50) {
      this.logger.warn('Retry queue full, dropping oldest message');
      this.retryQueue.shift();
    }
    this.retryQueue.push({ message, retries: 0 });
  }

  private async flushRetryQueue(): Promise<void> {
    const pending = [...this.retryQueue];
    this.retryQueue = [];

    for (const item of pending) {
      item.retries++;
      if (item.retries > this.maxRetries) {
        this.logger.warn(
          `Dropping message after ${this.maxRetries} failed retries`,
        );
        continue;
      }

      try {
        await this.waitForRateLimit();
        await this.bot.api.sendMessage(this.chatId, item.message, {
          parse_mode: 'HTML',
        });
        this.logger.log('Retry succeeded');
      } catch (err) {
        const error = err as { error_code?: number; message?: string };
        if (error.error_code === 429) {
          const retryAfter = this.parseRetryAfter(error.message ?? '');
          this.rateLimitedUntil = Date.now() + retryAfter * 1000;
          this.logger.warn(`Rate limited during retry, waiting ${retryAfter}s`);
        } else {
          this.logger.error(
            `Retry ${item.retries}/${this.maxRetries} failed: ${err}`,
          );
        }
        this.retryQueue.push(item);
      }
    }
  }
}
