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

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private bot!: Bot;
  private chatId!: string;
  private mintAddress!: string;

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

    this.bot = new Bot(token);
    this.registerCommands();
    this.logger.log('Telegram bot initialized');
  }

  async onModuleDestroy() {
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
          'Status: Active',
      ),
    );

    void this.bot.start({
      onStart: () => this.logger.log('Bot polling started'),
    });
  }

  async sendTransaction(tx: TransactionData) {
    const emoji = tx.type === 'buy' ? '🟢' : '🔴';
    const action = tx.type === 'buy' ? 'BOUGHT' : 'SOLD';
    const totalSupply = 1_000_000_000;
    const pct = ((tx.tokenAmount / totalSupply) * 100).toFixed(4);

    const message =
      `${emoji} <b>${action}</b>\n\n` +
      `<code>${tx.wallet}</code>\n` +
      `<b>${tx.tokenAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}</b> ARC (${pct}%)\n` +
      `<b>${tx.solAmount.toFixed(4)}</b> SOL\n\n` +
      `<a href="https://solscan.io/tx/${tx.signature}">Solscan</a> | <a href="https://pump.fun/coin/${this.mintAddress}">PumpFun</a>`;

    try {
      await this.bot.api.sendMessage(this.chatId, message, {
        parse_mode: 'HTML',
      });
      this.logger.log(`Sent ${tx.type} notification`);
    } catch (err) {
      this.logger.error(`Failed to send Telegram message: ${err}`);
    }
  }
}
