import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtOptionalAuthGuard } from '../../auth/jwt/jwt-optional.guard';
import { LiveStatsService } from './live-stats.service';
import type { LiveStatsResponse } from './live-stats.types';

@Controller('games')
export class LiveStatsController {
  constructor(private readonly liveStatsService: LiveStatsService) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(5000)
  @SkipThrottle({ default: true, auth: true, strict: true })
  @UseGuards(JwtOptionalAuthGuard)
  @Get('live-info')
  async getLiveInfo(): Promise<LiveStatsResponse> {
    return this.liveStatsService.getLiveStats();
  }
}
