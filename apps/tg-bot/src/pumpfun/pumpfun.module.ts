import { Module } from '@nestjs/common';
import { PumpFunListenerService } from './pumpfun-listener.service';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [TelegramModule],
  providers: [PumpFunListenerService],
})
export class PumpFunModule {}
