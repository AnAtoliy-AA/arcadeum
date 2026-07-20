import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { ImplementProcessor } from './implement.processor';
import { ReviewProcessor } from './review.processor';
import { ReviewQueueService } from '../queue/review-queue.service';
import { GitHubModule } from '../github/github.module';
import { NotificationModule } from '../notification/notification.module';
import { CIModule } from '../ci/ci.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST ?? '127.0.0.1',
          port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
          password: process.env.REDIS_PASSWORD,
        },
      }),
    }),
    BullModule.registerQueue(
      { name: 'implementation', defaultJobOptions: { removeOnComplete: 50, removeOnFail: 20 } },
      { name: 'review', defaultJobOptions: { removeOnComplete: 50, removeOnFail: 20 } },
    ),
    GitHubModule,
    NotificationModule,
    CIModule,
  ],
  providers: [
    { provide: ImplementProcessor, useClass: ImplementProcessor },
    { provide: ReviewProcessor, useClass: ReviewProcessor },
    ReviewQueueService,
  ],
})
export class WorkerModule {}
