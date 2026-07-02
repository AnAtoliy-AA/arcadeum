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
import { GameRuleVisibilityService } from './game-rule-visibility.service';
import { GAME_CATALOG } from '../../games/games.catalog';
import { IsBoolean } from 'class-validator';

class SetRuleDto {
  @IsBoolean()
  enabled!: boolean;
}

class BulkSetRulesDto {
  rules!: Array<{ ruleId: string; enabled: boolean }>;
}

@Controller('admin/game-rules')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class GameRuleVisibilityController {
  constructor(private readonly ruleVisibility: GameRuleVisibilityService) {}

  @Get()
  async getAllRules() {
    const allRules = await this.ruleVisibility.getAllRules();
    const result: Record<
      string,
      Array<{ ruleId: string; label: string; enabled: boolean }>
    > = {};

    for (const entry of GAME_CATALOG) {
      if (entry.rules.length === 0) continue;
      const ruleMap = allRules.get(entry.gameId) ?? new Map<string, boolean>();
      result[entry.gameId] = entry.rules.map((r) => ({
        ruleId: r.ruleId,
        label: r.label,
        enabled: ruleMap.get(r.ruleId) ?? true,
      }));
    }

    return result;
  }

  @Put(':gameId/:ruleId')
  async setRule(
    @Param('gameId') gameId: string,
    @Param('ruleId') ruleId: string,
    @Body() dto: SetRuleDto,
    @Req() req: Request,
  ) {
    const userId = (req.user as { userId: string })?.userId;
    await this.ruleVisibility.setRuleEnabled(
      gameId,
      ruleId,
      dto.enabled,
      userId,
    );
    return { success: true };
  }

  @Put(':gameId')
  async bulkSetRules(
    @Param('gameId') gameId: string,
    @Body() dto: BulkSetRulesDto,
    @Req() req: Request,
  ) {
    const userId = (req.user as { userId: string })?.userId;
    await this.ruleVisibility.setAllRulesForGame(gameId, dto.rules, userId);
    return { success: true };
  }
}
