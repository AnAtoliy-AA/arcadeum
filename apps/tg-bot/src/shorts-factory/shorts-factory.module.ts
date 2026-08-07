import { Module } from '@nestjs/common';
import { ShortsFactoryService } from './shorts-factory.service';
import { ShortsFactoryController } from './shorts-factory.controller';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [TelegramModule],
  controllers: [ShortsFactoryController],
  providers: [ShortsFactoryService],
  exports: [ShortsFactoryService],
})
export class ShortsFactoryModule {}
