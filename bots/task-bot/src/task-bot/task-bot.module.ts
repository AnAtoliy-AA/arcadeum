import { Module } from '@nestjs/common';
import { TaskBotService } from './task-bot.service';
import { TelegramModule } from '../telegram/telegram.module';
import { RoadmapModule } from '../roadmap/roadmap.module';

@Module({
  imports: [TelegramModule, RoadmapModule],
  providers: [TaskBotService],
  exports: [TaskBotService],
})
export class TaskBotModule {}
