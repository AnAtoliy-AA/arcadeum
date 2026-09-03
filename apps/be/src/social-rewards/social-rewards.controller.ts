import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { SocialRewardsService } from './social-rewards.service';
import { ClaimSocialRewardDto } from './dto/claim-social-reward.dto';

@Controller('social-rewards')
export class SocialRewardsController {
  constructor(private readonly socialRewardsService: SocialRewardsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getStatus(@Req() req: Request) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.socialRewardsService.getStatus(user.userId);
  }

  @Post('claim')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  async claimReward(@Req() req: Request, @Body() dto: ClaimSocialRewardDto) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.socialRewardsService.claimReward(user.userId, dto.platform);
  }
}
