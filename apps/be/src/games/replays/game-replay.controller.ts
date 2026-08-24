import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtOptionalAuthGuard } from '../../auth/jwt/jwt-optional.guard';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard';
import { type AuthenticatedUser } from '../../auth/jwt/jwt.strategy';
import { ListReplaysQueryDto } from './dtos/list-replays.dto';
import {
  GameReplayService,
  type ReplayDetail,
  type ReplaySummary,
} from './game-replay.service';

@Controller('games/replays')
export class GameReplayController {
  constructor(private readonly replayService: GameReplayService) {}

  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  async listReplays(@Query() query: ListReplaysQueryDto): Promise<{
    entries: ReplaySummary[];
    total: number;
    hasMore: boolean;
  }> {
    const pageNum = query.page ?? 0;
    const limitNum = query.limit ?? 20;

    return this.replayService.listReplays(query.gameId, pageNum, limitNum);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  async listMyReplays(
    @Req() req: Request,
    @Query() query: ListReplaysQueryDto,
  ): Promise<{
    entries: ReplaySummary[];
    total: number;
    hasMore: boolean;
  }> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      return { entries: [], total: 0, hasMore: false };
    }

    const pageNum = query.page ?? 0;
    const limitNum = query.limit ?? 20;

    return this.replayService.listReplaysForUser(
      user.userId,
      pageNum,
      limitNum,
    );
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get('by-room/:roomId')
  async getReplayByRoom(
    @Param('roomId') roomId: string,
  ): Promise<{ replay: ReplaySummary }> {
    const replay = await this.replayService.getReplayByRoom(roomId);
    if (!replay) {
      throw new NotFoundException('Replay not found for this room');
    }
    return { replay };
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':replayId')
  async getReplay(
    @Param('replayId') replayId: string,
  ): Promise<{ replay: ReplayDetail }> {
    const replay = await this.replayService.getReplay(replayId);
    if (!replay) {
      throw new NotFoundException('Replay not found');
    }
    return { replay };
  }
}
