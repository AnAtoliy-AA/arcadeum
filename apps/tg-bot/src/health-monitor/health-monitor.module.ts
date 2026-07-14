import { Module } from '@nestjs/common';
import { HealthMonitorService } from './health-monitor.service';

@Module({
  providers: [HealthMonitorService],
})
export class HealthMonitorModule {}
