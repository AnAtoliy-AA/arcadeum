import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ActivityFeedService } from './activity-feed.service';
import { GetActivityFeedDto } from './dto/get-activity-feed.dto';
import type { ActivityFeedPageDto } from './activity-feed.types';

/**
 * Public by design: the home page feed is visible to signed-out visitors.
 * The response only carries public profile data (see ActivityFeedActorDto).
 */
@Controller('activity')
export class ActivityFeedController {
  constructor(private readonly feedService: ActivityFeedService) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(15000)
  @Get('feed')
  getFeed(@Query() query: GetActivityFeedDto): Promise<ActivityFeedPageDto> {
    return this.feedService.getFeed(query);
  }
}
