import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { ImplementQueueService } from './implement-queue.service';
import { ReviewQueueService } from './review-queue.service';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST') ?? '127.0.0.1',
          port: parseInt(config.get<string>('REDIS_PORT') ?? '6379', 10),
          password: config.get<string>('REDIS_PASSWORD'),
        },
      }),
    }),
    BullModule.registerQueue({ name: 'implementation' }),
    BullModule.registerQueue({ name: 'review' }),
  ],
  providers: [ImplementQueueService, ReviewQueueService],
  exports: [ImplementQueueService, ReviewQueueService, BullModule],
})
export class QueueModule {}
