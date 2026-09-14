import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ActivityFeedService } from './activity-feed.service';

@Controller('activity')
export class ActivityFeedController {
  constructor(private readonly feedService: ActivityFeedService) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30000)
  @Get('feed')
  getFeed(@Query('limit') limit?: string, @Query('before') before?: string) {
    return this.feedService.getFeed({
      limit: limit ? parseInt(limit, 10) : 20,
      before,
    });
  }
}
