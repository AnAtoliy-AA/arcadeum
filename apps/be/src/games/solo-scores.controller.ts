import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { JwtOptionalAuthGuard } from '../auth/jwt/jwt-optional.guard';
import { type AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { SoloScoresService } from './solo-scores.service';
import { SyncSoloScoresDto } from './dtos/sync-solo-scores.dto';

@Controller('games/solo-scores')
export class SoloScoresController {
  constructor(private readonly soloScoresService: SoloScoresService) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60_000)
  @UseGuards(JwtOptionalAuthGuard)
  @Get('leaderboard')
  async getLeaderboard(
    @Query('gameId') gameId: string,
    @Query('difficulty') difficulty: string,
    @Query('sortBy') sortBy?: 'score' | 'durationMs',
    @Query('order') order?: 'asc' | 'desc',
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    return this.soloScoresService.getLeaderboard(
      gameId,
      difficulty,
      sortBy,
      order,
      limitNum,
      offsetNum,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('best')
  async getPersonalBests(
    @Req() req: Request,
    @Query('gameId') gameId?: string,
  ) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    return this.soloScoresService.getPersonalBests(user.userId, gameId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync')
  async syncScores(@Req() req: Request, @Body() dto: SyncSoloScoresDto) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    return this.soloScoresService.syncScores(user.userId, dto.records);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recent')
  async getRecentGames(
    @Req() req: Request,
    @Query('gameId') gameId?: string,
    @Query('difficulty') difficulty?: string,
    @Query('limit') limit?: string,
  ) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.soloScoresService.getRecentGames(
      user.userId,
      gameId,
      difficulty,
      limitNum,
    );
  }
}
