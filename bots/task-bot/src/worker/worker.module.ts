import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { ImplementProcessor } from './implement.processor';
import { ReviewProcessor } from './review.processor';
import { ReviewQueueService } from '../queue/review-queue.service';
import { GitHubModule } from '../github/github.module';

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
    BullModule.registerQueue({ name: 'implementation' }),
    BullModule.registerQueue({ name: 'review' }),
    GitHubModule,
  ],
  providers: [ImplementProcessor, ReviewProcessor, ReviewQueueService],
})
export class WorkerModule {}
