import { Module } from '@nestjs/common';
import { TaskBotService } from './task-bot.service';
import { TelegramModule } from '../telegram/telegram.module';
import { RoadmapModule } from '../roadmap/roadmap.module';
import { PreferencesModule } from '../preferences/preferences.module';
import { GitHubModule } from '../github/github.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    TelegramModule,
    RoadmapModule,
    PreferencesModule,
    GitHubModule,
    QueueModule,
  ],
  providers: [TaskBotService],
  exports: [TaskBotService],
})
export class TaskBotModule {}
