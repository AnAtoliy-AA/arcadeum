import { Module } from '@nestjs/common';
import { TelegramModule } from '../telegram/telegram.module';
import { ShortsFactoryController } from './shorts-factory.controller';
import { ShortsFactoryService } from './shorts-factory.service';

@Module({
  imports: [TelegramModule],
  controllers: [ShortsFactoryController],
  providers: [ShortsFactoryService],
  exports: [ShortsFactoryService],
})
export class ShortsFactoryModule {}
