import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/guards/roles.decorator';
import type { AuthenticatedUser } from '../../auth/jwt/jwt.strategy';
import { GameVisibilityService } from './game-visibility.service';
import { SetTierDto } from './dto/set-tier.dto';
import type { AdminGameVisibilityRow } from './game-visibility.types';

@Controller('admin/games')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class GameVisibilityController {
  constructor(private readonly service: GameVisibilityService) {}

  @Get('visibility')
  list(): Promise<AdminGameVisibilityRow[]> {
    return this.service.listForAdmin();
  }

  @Put(':gameId/visibility')
  async setGameTier(
    @Req() req: Request,
    @Param('gameId') gameId: string,
    @Body() dto: SetTierDto,
  ): Promise<{ ok: true }> {
    const adminId = (req.user as AuthenticatedUser).userId;
    await this.service.setGameTier(gameId, dto.tier, adminId);
    return { ok: true };
  }

  @Put(':gameId/variants/:variantId/visibility')
  async setVariantTier(
    @Req() req: Request,
    @Param('gameId') gameId: string,
    @Param('variantId') variantId: string,
    @Body() dto: SetTierDto,
  ): Promise<{ ok: true }> {
    const adminId = (req.user as AuthenticatedUser).userId;
    await this.service.setVariantTier(gameId, variantId, dto.tier, adminId);
    return { ok: true };
  }
}
