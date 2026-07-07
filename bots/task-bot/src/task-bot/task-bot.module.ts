import { Module } from '@nestjs/common';
import { TaskBotService } from './task-bot.service';
import { TelegramModule } from '../telegram/telegram.module';
import { RoadmapModule } from '../roadmap/roadmap.module';
import { PreferencesModule } from '../preferences/preferences.module';
import { GitHubModule } from '../github/github.module';

@Module({
  imports: [TelegramModule, RoadmapModule, PreferencesModule, GitHubModule],
  providers: [TaskBotService],
  exports: [TaskBotService],
})
export class TaskBotModule {}
