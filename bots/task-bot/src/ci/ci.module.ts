import { Module } from '@nestjs/common';
import { CIController } from './ci.controller';
import { QueueModule } from '../queue/queue.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [QueueModule, NotificationModule],
  controllers: [CIController],
})
export class CIModule {}
