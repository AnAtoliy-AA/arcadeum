import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot } from 'grammy';

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
    this.logger.log('Task bot initialized');
  }

  getBot(): Bot {
    return this.bot;
  }

  async onModuleDestroy() {
    await this.bot.stop();
  }
}
