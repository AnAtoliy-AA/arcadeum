import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { JwtOptionalAuthGuard } from '../auth/jwt/jwt-optional.guard';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { AchievementsService } from './achievements.service';
import { ClaimAchievementDto } from './dto/claim-achievement.dto';

@Controller('achievements')
export class AchievementsController {
  constructor(private readonly service: AchievementsService) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30000)
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getStatus(@Req() req: Request) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    return this.service.getStatus(user.userId);
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
  @Get('user/:userId')
  @UseGuards(JwtOptionalAuthGuard)
  getUserAchievements(@Param('userId') userId: string) {
    return this.service.getUserAchievements(userId);
  }

  @Post('claim')
  @UseGuards(JwtAuthGuard)
  async claim(@Req() req: Request, @Body() dto: ClaimAchievementDto) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    return this.service.claimReward(user.userId, dto.achievementId);
  }

  @Post('check')
  @UseGuards(JwtAuthGuard)
  async check(@Req() req: Request) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    return this.service.checkAndUnlock(user.userId);
  }
}
