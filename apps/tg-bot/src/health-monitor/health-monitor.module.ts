import { Module } from '@nestjs/common';
import { HealthMonitorService } from './health-monitor.service';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [TelegramModule],
  providers: [HealthMonitorService],
})
export class HealthMonitorModule {}
