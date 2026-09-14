import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { LevelRewardsService } from './level-rewards.service';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

interface RequestWithUser {
  user: AuthenticatedUser;
}

@Controller('xp/level-rewards')
@UseGuards(JwtAuthGuard)
export class LevelRewardsController {
  constructor(private readonly levelRewardsService: LevelRewardsService) {}

  @Get()
  getStatus(@Req() req: RequestWithUser) {
    return this.levelRewardsService.getStatus(req.user.userId);
  }

  @Post('claim')
  claim(@Req() req: RequestWithUser) {
    return this.levelRewardsService.claim(req.user.userId);
  }
}
