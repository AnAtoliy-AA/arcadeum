import {
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ACTIVITY_FEED_FILTERS,
  type ActivityFeedFilter,
} from '../activity-feed.types';

export class GetActivityFeedDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  /** Cursor: ISO timestamp of the last item already shown. */
  @IsOptional()
  @IsISO8601()
  before?: string;

  @IsOptional()
  @IsIn(ACTIVITY_FEED_FILTERS)
  filter?: ActivityFeedFilter;

  @IsOptional()
  @Matches(/^[a-z0-9_]{1,64}$/)
  gameId?: string;
}
