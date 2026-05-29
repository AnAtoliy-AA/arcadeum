import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { BattlePassService } from './battle-pass.service';
import { ClaimTierDto } from './dto/battle-pass.dto';

@Controller('battle-pass')
@UseGuards(JwtAuthGuard)
export class BattlePassController {
  constructor(private readonly battlePass: BattlePassService) {}

  @Get()
  async getState(@Req() req: { user: AuthenticatedUser }) {
    return this.battlePass.getState(req.user.userId);
  }

  @Post('claim')
  async claim(
    @Req() req: { user: AuthenticatedUser },
    @Body() body: ClaimTierDto,
  ) {
    return this.battlePass.claim(req.user.userId, body.tier);
  }
}
