import {
  BadRequestException,
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

function sanitizeString(value: unknown, name: string): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') {
    throw new BadRequestException(`${name} must be a string`);
  }
  return value;
}

@Controller('games/solo-scores')
export class SoloScoresController {
  constructor(private readonly soloScoresService: SoloScoresService) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60_000)
  @UseGuards(JwtOptionalAuthGuard)
  @Get('leaderboard')
  async getLeaderboard(
    @Query('gameId') gameId: unknown,
    @Query('difficulty') difficulty: unknown,
    @Query('sortBy') sortBy?: 'score' | 'durationMs',
    @Query('order') order?: 'asc' | 'desc',
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const safeGameId = sanitizeString(gameId, 'gameId');
    const safeDifficulty = sanitizeString(difficulty, 'difficulty');
    if (!safeGameId || !safeDifficulty) {
      throw new BadRequestException('gameId and difficulty are required');
    }
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    return this.soloScoresService.getLeaderboard(
      safeGameId,
      safeDifficulty,
      sortBy,
      order,
      limitNum,
      offsetNum,
    );
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get('best')
  async getPersonalBests(
    @Req() req: Request,
    @Query('gameId') gameId?: unknown,
  ) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) return [];
    const safeGameId = sanitizeString(gameId, 'gameId');
    return this.soloScoresService.getPersonalBests(user.userId, safeGameId);
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
    @Query('gameId') gameId?: unknown,
    @Query('difficulty') difficulty?: unknown,
    @Query('limit') limit?: string,
  ) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.soloScoresService.getRecentGames(
      user.userId,
      sanitizeString(gameId, 'gameId'),
      sanitizeString(difficulty, 'difficulty'),
      limitNum,
    );
  }
}
