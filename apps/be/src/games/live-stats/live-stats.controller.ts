import { Controller, Get, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtOptionalAuthGuard } from '../../auth/jwt/jwt-optional.guard';
import { LiveStatsService } from './live-stats.service';
import type { LiveStatsResponse } from './live-stats.types';

@Controller('games')
export class LiveStatsController {
  constructor(private readonly liveStatsService: LiveStatsService) {}

  @SkipThrottle({ default: true, auth: true, strict: true })
  @UseGuards(JwtOptionalAuthGuard)
  @Get('live-info')
  async getLiveInfo(): Promise<LiveStatsResponse> {
    return this.liveStatsService.getLiveStats();
  }
}
