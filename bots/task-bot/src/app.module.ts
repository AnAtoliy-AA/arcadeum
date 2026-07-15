import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramModule } from './telegram/telegram.module';
import { TaskBotModule } from './task-bot/task-bot.module';
import { QueueModule } from './queue/queue.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TelegramModule,
    QueueModule,
    TaskBotModule,
    NotificationModule,
  ],
})
export class AppModule {}
