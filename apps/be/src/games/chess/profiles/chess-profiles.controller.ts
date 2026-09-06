import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt/jwt.guard';
import { ChessProfilesService } from './chess-profiles.service';

@Controller('chess/profiles')
export class ChessProfilesController {
  constructor(private readonly profilesService: ChessProfilesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@Request() req: { user: { id: string } }) {
    return this.profilesService.getOrCreateProfile(req.user.id);
  }

  @Get(':userId')
  async getProfile(@Param('userId') userId: string) {
    return this.profilesService.getProfile(userId);
  }

  @Post('me')
  @UseGuards(JwtAuthGuard)
  async updateMyProfile(
    @Request() req: { user: { id: string } },
    @Body() body: { bio?: string; country?: string; title?: string },
  ) {
    return this.profilesService.updateProfile(req.user.id, body);
  }

  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  async getMyStats(@Request() req: { user: { id: string } }) {
    return this.profilesService.getStats(req.user.id);
  }

  @Get('leaderboard/:gameType')
  async getLeaderboard(
    @Param('gameType') gameType: string,
    @Query('limit') limit?: string,
  ) {
    return this.profilesService.getLeaderboard(
      gameType,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
