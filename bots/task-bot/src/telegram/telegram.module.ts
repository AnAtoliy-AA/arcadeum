import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { BOT_TOKEN } from '../task-bot/telegram.decorator';

@Module({
  providers: [
    TelegramService,
    {
      provide: BOT_TOKEN,
      useFactory: (svc: TelegramService) => svc.getBot(),
      inject: [TelegramService],
    },
  ],
  exports: [TelegramService, BOT_TOKEN],
})
export class TelegramModule {}
