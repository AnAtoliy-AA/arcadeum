import {
  ConflictException,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { DailyRewardsService } from './daily-rewards.service';
import { DailyRewardAlreadyClaimedError } from './daily-rewards.errors';

@Controller('daily-rewards')
export class DailyRewardsController {
  constructor(private readonly service: DailyRewardsService) {}

  /**
   * GET /daily-rewards/me — return the current user's claim status. Used by
   * the wallet/home pages to decide whether to show the Claim CTA, render
   * the streak stamps, and run the countdown.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getStatus(@Req() req: Request) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    return this.service.getStatus(user.userId);
  }

  /**
   * POST /daily-rewards/claim — claim today's daily reward. Idempotent per
   * UTC day; a second claim same day returns 409 Conflict.
   */
  @Post('claim')
  @UseGuards(JwtAuthGuard)
  async claim(@Req() req: Request) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    try {
      return await this.service.claim(user.userId);
    } catch (err) {
      if (err instanceof DailyRewardAlreadyClaimedError) {
        // i18n key for the web client to map to a toast.
        throw new ConflictException('dailyRewards.errors.alreadyClaimed');
      }
      throw err;
    }
  }
}
