import {
  BadRequestException,
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
  async claim(@Req() req: Request) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    const body = req.body as { challengeId?: string; date?: string };
    if (!body.challengeId || !body.date) {
      throw new BadRequestException('challengeId and date are required');
    }
    return this.service.claimReward(user.userId, body.challengeId, body.date);
  }
}
