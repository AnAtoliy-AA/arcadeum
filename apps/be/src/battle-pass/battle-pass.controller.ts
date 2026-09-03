import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { BattlePassService } from './battle-pass.service';
import { ClaimTierDto } from './dto/battle-pass.dto';

@Controller('battle-pass')
@UseGuards(JwtAuthGuard)
export class BattlePassController {
  constructor(private readonly battlePass: BattlePassService) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
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
