import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { WeeklyLeagueService, weekKeyForDate } from './weekly-league.service';
import type { LeagueTier } from './schemas/weekly-league.schema';
import { LEAGUE_TIERS } from './schemas/weekly-league.schema';

@Controller('leagues')
export class LeaguesController {
  constructor(private readonly leagueService: WeeklyLeagueService) {}

  /**
   * GET /leagues/me — return the current user's weekly league standing.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyLeague(@Req() req: Request) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) return null;
    const snapshot = await this.leagueService.getUserLeague(user.userId);
    if (!snapshot) {
      throw new NotFoundException('No league assignment found');
    }
    return snapshot;
  }

  /**
   * GET /leagues/:tier — return the league standings for a specific tier.
   */
  @Get(':tier')
  async getTierLeague(@Param('tier') tier: LeagueTier) {
    if (!(LEAGUE_TIERS as readonly string[]).includes(tier)) {
      throw new NotFoundException(`Invalid tier: ${tier}`);
    }
    const now = new Date();
    const weekKey = weekKeyForDate(now);
    const league = await this.leagueService.getOrCreateLeague(tier, weekKey, 0);
    const sorted = [...league.participants].sort(
      (a, b) => b.trophies - a.trophies,
    );
    return {
      tier,
      weekKey,
      participants: sorted.map((p, i) => ({
        rank: i + 1,
        userId: p.userId.toHexString(),
        username: p.username,
        trophies: p.trophies,
        prevRank: p.prevRank,
      })),
      promoteCount: league.promoteCount,
      demoteCount: league.demoteCount,
    };
  }
}
