import { Module } from '@nestjs/common';
import { CIController } from './ci.controller';
import { CIFixTrackerService } from './ci-fix-tracker.service';
import { CIFollService } from './ci-poll.service';
import { QueueModule } from '../queue/queue.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [QueueModule, NotificationModule],
  controllers: [CIController],
  providers: [CIFixTrackerService, CIFollService],
  exports: [CIFixTrackerService, CIFollService],
})
export class CIModule {}
