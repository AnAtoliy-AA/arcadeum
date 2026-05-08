import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtOptionalAuthGuard } from '../auth/jwt/jwt-optional.guard';
import { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { GetLeaderboardDto } from './dtos/get-leaderboard.dto';
import { SeedLeaderboardDto } from './dtos/seed-leaderboard.dto';
import { LeaderboardsService } from './leaderboards.service';
import { LeaderboardsSeederService } from './leaderboards.seeder';
import { LeaderboardsCaptureService } from './leaderboards.capture.service';

function adminEnabled(): boolean {
  return process.env.LEADERBOARDS_ADMIN_ENABLED === 'true';
}

@Controller('leaderboards')
export class LeaderboardsController {
  constructor(
    private readonly service: LeaderboardsService,
    private readonly seeder: LeaderboardsSeederService,
    private readonly capture: LeaderboardsCaptureService,
  ) {}

  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  async getLeaderboard(@Query() query: GetLeaderboardDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser | null | undefined;
    return this.service.getSnapshot({
      mode: query.mode,
      page: query.page,
      pageSize: query.pageSize,
      q: query.q,
      selfUserId: user?.userId,
    });
  }

  @Post('admin/seed')
  @HttpCode(HttpStatus.OK)
  async seed(@Body() body: SeedLeaderboardDto) {
    if (!adminEnabled()) {
      throw new NotFoundException();
    }
    return this.seeder.seed({
      rowsPerMode: body.rowsPerMode,
      season: body.season,
    });
  }

  @Post('admin/capture')
  @HttpCode(HttpStatus.OK)
  async runCapture() {
    if (!adminEnabled()) {
      throw new NotFoundException();
    }
    const results = await this.capture.captureAll();
    return { results };
  }
}
