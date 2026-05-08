import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtOptionalAuthGuard } from '../auth/jwt/jwt-optional.guard';
import { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { GetLeaderboardDto } from './dtos/get-leaderboard.dto';
import { LeaderboardsService } from './leaderboards.service';

@Controller('leaderboards')
export class LeaderboardsController {
  constructor(private readonly service: LeaderboardsService) {}

  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  async getLeaderboard(@Query() query: GetLeaderboardDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser | null | undefined;
    return this.service.getSnapshot({
      mode: query.mode,
      page: query.page,
      pageSize: query.pageSize,
      selfUserId: user?.userId,
    });
  }
}
