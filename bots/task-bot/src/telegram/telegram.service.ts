import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot, type Context } from 'grammy';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private bot!: Bot;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is required');
    }

    this.bot = new Bot(token);
    this.registerCommands();
    this.logger.log('Task bot initialized');
  }

  getBot(): Bot {
    return this.bot;
  }

  async onModuleDestroy() {
    await this.bot.stop();
  }

  private registerCommands() {
    this.bot.command('start', (ctx: Context) =>
      ctx.reply(
        'Task Bot is active.\n' +
          'Send a task with /task or as a message with ARC-XXX prefix.',
      ),
    );

    this.bot.command('help', (ctx: Context) =>
      ctx.reply(
        'Available commands:\n' +
          '/task <title> - Create a task (ARC auto-assigned)\n' +
          '/tasks - List open tasks\n' +
          '/implement #12 - Implement an issue\n' +
          '/status #12 - Check implementation status\n' +
          '/help - Show this message',
      ),
    );

    void this.bot.start({
      onStart: () => this.logger.log('Bot polling started'),
    });
  }
}
