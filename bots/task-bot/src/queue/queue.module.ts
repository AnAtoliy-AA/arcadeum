import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { ImplementQueueService } from './implement-queue.service';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST') ?? '127.0.0.1',
          port: parseInt(config.get<string>('REDIS_PORT') ?? '6379', 10),
        },
      }),
    }),
    BullModule.registerQueue({ name: 'implementation' }),
  ],
  providers: [ImplementQueueService],
  exports: [ImplementQueueService, BullModule],
})
export class QueueModule {}
