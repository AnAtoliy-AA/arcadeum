import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { ReferralService } from './referral.service';

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
  async trackReferral(
    @Body() body: { referralCode: string; referredUserId: string },
  ) {
    await this.referralService.trackReferral(
      body.referralCode,
      body.referredUserId,
    );
    return { success: true };
  }
}
