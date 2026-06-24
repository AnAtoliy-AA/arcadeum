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
import { AchievementsService } from './achievements.service';

@Controller('achievements')
export class AchievementsController {
  constructor(private readonly service: AchievementsService) {}

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
    const body = req.body as { achievementId?: string };
    if (!body.achievementId) {
      throw new BadRequestException('achievementId is required');
    }
    return this.service.claimReward(user.userId, body.achievementId);
  }

  @Post('check')
  @UseGuards(JwtAuthGuard)
  async check(@Req() req: Request) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    return this.service.checkAndUnlock(user.userId);
  }
}
