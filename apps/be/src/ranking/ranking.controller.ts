import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { JwtOptionalAuthGuard } from '../auth/jwt/jwt-optional.guard';
import { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { GetRankingsQueryDto } from './dtos/ranking.dto';
import type { MyRankingDto, RankingSnapshotDto } from './dtos/ranking.dto';
import { RankingService } from './ranking.service';

@Controller('rankings')
export class RankingController {
  constructor(private readonly ranking: RankingService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyRankings(@Req() req: Request): Promise<MyRankingDto[]> {
    const user = req.user as AuthenticatedUser;
    return this.ranking.getMyRankings(user.userId);
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
  @Get(':gameId')
  @UseGuards(JwtOptionalAuthGuard)
  async getRankings(
    @Param('gameId') gameId: string,
    @Query() query: GetRankingsQueryDto,
  ): Promise<RankingSnapshotDto> {
    if (!gameId || gameId.length > 64) {
      throw new BadRequestException('invalid game id');
    }
    return this.ranking.getRankings(gameId, query.limit, query.offset);
  }
}
