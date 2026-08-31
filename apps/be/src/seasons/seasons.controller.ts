import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { SeasonsService } from './seasons.service';
import { ListSeasonsQueryDto, SeasonBoardQueryDto } from './dtos/seasons.dto';
import type {
  SeasonBoardSnapshotDto,
  SeasonDetailView,
  SeasonView,
} from './dtos/seasons.dto';

@Controller('seasons')
export class SeasonsController {
  constructor(private readonly seasons: SeasonsService) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
  @Get('current')
  getCurrentSeason(): Promise<SeasonDetailView> {
    return this.seasons.getCurrentSeason();
  }

  @Get('current/leaderboard')
  getCurrentLeaderboard(
    @Query() query: SeasonBoardQueryDto,
  ): Promise<SeasonBoardSnapshotDto> {
    return this.seasons.getLeaderboardForCurrent(query);
  }

  @Get(':seasonId/leaderboard')
  getLeaderboard(
    @Param('seasonId') seasonId: string,
    @Query() query: SeasonBoardQueryDto,
  ): Promise<SeasonBoardSnapshotDto> {
    return this.seasons.getLeaderboard(seasonId, query);
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
  @Get()
  listSeasons(@Query() query: ListSeasonsQueryDto): Promise<SeasonView[]> {
    return this.seasons.listSeasons(query.limit);
  }

  @Get(':seasonId')
  getSeason(
    @Param('seasonId') seasonId: string,
  ): Promise<SeasonDetailView | null> {
    return this.seasons.getSeasonById(seasonId);
  }
}
