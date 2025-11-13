import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import type { LiveStatus } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRootStatus(): LiveStatus {
    return this.appService.getLiveStatus();
  }

  @Get('health')
  health() {
    return { ok: true };
  }
}
