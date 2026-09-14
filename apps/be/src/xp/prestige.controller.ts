import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { PrestigeService } from './prestige.service';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

interface RequestWithUser {
  user: AuthenticatedUser;
}

@Controller('xp/prestige')
@UseGuards(JwtAuthGuard)
export class PrestigeController {
  constructor(private readonly prestigeService: PrestigeService) {}

  @Get()
  getStatus(@Req() req: RequestWithUser) {
    return this.prestigeService.getPrestige(req.user.userId);
  }

  @Post()
  doPrestige(@Req() req: RequestWithUser) {
    return this.prestigeService.prestige(req.user.userId);
  }
}
