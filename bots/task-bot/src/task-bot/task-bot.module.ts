import { Module } from '@nestjs/common';
import { TaskBotService } from './task-bot.service';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [TelegramModule],
  providers: [TaskBotService],
  exports: [TaskBotService],
})
export class TaskBotModule {}
