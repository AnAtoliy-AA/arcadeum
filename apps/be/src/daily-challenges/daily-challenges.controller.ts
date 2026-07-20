import {
  Body,
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
import { DailyChallengesService } from './daily-challenges.service';
import { ClaimChallengeRewardDto } from './dto/daily-challenge.dto';

@Controller('daily-challenges')
export class DailyChallengesController {
  constructor(private readonly service: DailyChallengesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getStatus(@Req() req: Request) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    return this.service.getStatus(user.userId);
  }

  @Post('claim')
  @UseGuards(JwtAuthGuard)
  async claim(@Req() req: Request, @Body() dto: ClaimChallengeRewardDto) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    return this.service.claimReward(user.userId, dto.challengeId, dto.date);
  }
}
