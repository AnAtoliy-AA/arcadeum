import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PumpFunModule } from './pumpfun/pumpfun.module';
import { TelegramModule } from './telegram/telegram.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PumpFunModule,
    TelegramModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
