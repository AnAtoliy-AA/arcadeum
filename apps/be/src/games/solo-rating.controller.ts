import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtOptionalAuthGuard } from '../auth/jwt/jwt-optional.guard';
import { type AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { SoloRatingService } from './solo-rating.service';

@Controller('games/solo-rating')
export class SoloRatingController {
  constructor(private readonly soloRatingService: SoloRatingService) {}

  @UseGuards(JwtOptionalAuthGuard)
  @Get('me')
  async getMyRating(@Req() req: Request) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) return null;
    return this.soloRatingService.getRating(user.userId);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get('leaderboard')
  async getLeaderboard(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    return this.soloRatingService.getLeaderboard(limitNum, offsetNum);
  }
}
