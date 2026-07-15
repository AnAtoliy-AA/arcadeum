import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { ImplementProcessor } from './implement.processor';
import { GitHubModule } from '../github/github.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST ?? '127.0.0.1',
          port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
        },
      }),
    }),
    BullModule.registerQueue({ name: 'implementation' }),
    GitHubModule,
  ],
  providers: [ImplementProcessor],
})
export class WorkerModule {}
