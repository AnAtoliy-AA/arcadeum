import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PumpFunModule } from './pumpfun/pumpfun.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PumpFunModule,
    TelegramModule,
  ],
})
export class AppModule {}
