import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { ReferralService } from './referral.service';
import { TrackReferralDto } from './dtos/track-referral.dto';

@Controller('referrals')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@Req() req: Request) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.referralService.getReferralStats(user.userId);
  }

  @Get('rewards-config')
  @UseGuards(JwtAuthGuard)
  async getRewardsConfig() {
    return this.referralService.getRewardsConfig();
  }

  @Get('code')
  @UseGuards(JwtAuthGuard)
  async getCode(@Req() req: Request) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }
    const code = await this.referralService.ensureReferralCode(user.userId);
    return { referralCode: code };
  }

  @Post('track')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  async trackReferral(@Req() req: Request, @Body() dto: TrackReferralDto) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }
    await this.referralService.trackReferral(dto.referralCode, user.userId);
    return { success: true };
  }
}
