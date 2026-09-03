import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import type { Request } from 'express';
import { JwtOptionalAuthGuard } from '../auth/jwt/jwt-optional.guard';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { GetLeaderboardDto } from './dtos/get-leaderboard.dto';
import { SeedLeaderboardDto } from './dtos/seed-leaderboard.dto';
import { LeaderboardsService } from './leaderboards.service';
import { LeaderboardsSeederService } from './leaderboards.seeder';
import { LeaderboardsCaptureService } from './leaderboards.capture.service';

@Controller('leaderboards')
export class LeaderboardsController {
  constructor(
    private readonly service: LeaderboardsService,
    private readonly seeder: LeaderboardsSeederService,
    private readonly capture: LeaderboardsCaptureService,
  ) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  async getLeaderboard(@Query() query: GetLeaderboardDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser | null | undefined;
    return this.service.getSnapshot({
      mode: query.mode,
      page: query.page,
      pageSize: query.pageSize,
      q: query.q,
      scope: query.scope,
      range: query.range,
      selfUserId: user?.userId,
    });
  }

  @Get('players/:id')
  async getPlayer(@Param('id') id: string) {
    if (!id || id.length > 64) {
      throw new BadRequestException('invalid player id');
    }
    const player = await this.service.getPlayer(id);
    if (!player) throw new NotFoundException();
    return player;
  }

  @Post('admin/seed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async seed(@Body() body: SeedLeaderboardDto) {
    return this.seeder.seed({
      rowsPerMode: body.rowsPerMode,
      season: body.season,
    });
  }

  @Post('admin/capture')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async runCapture() {
    const results = await this.capture.captureAll();
    return { results };
  }
}
