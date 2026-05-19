import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { JwtOptionalAuthGuard } from '../auth/jwt/jwt-optional.guard';
import { type AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { GamesService } from './games.service';
import { HistoryRematchDto } from './dtos/history-rematch.dto';
import { type GameRoomStatus } from './schemas/game-room.schema';

@Controller('games')
export class GamesHistoryController {
  constructor(private readonly gamesService: GamesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async listHistory(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ): Promise<{
    entries: Awaited<ReturnType<GamesService['listHistoryForUser']>>['entries'];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }

    const pageNum = page ? parseInt(page, 10) : 0;
    const limitNum = limit ? parseInt(limit, 10) : 20;

    const result = await this.gamesService.listHistoryForUser(user.userId, {
      page: pageNum,
      limit: limitNum,
      search: search?.trim(),
      status: status as GameRoomStatus | undefined,
    });

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('history/:roomId')
  async getHistoryEntry(
    @Req() req: Request,
    @Param('roomId') roomId: string,
  ): Promise<Awaited<ReturnType<GamesService['getHistoryEntry']>>> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.gamesService.getHistoryEntry(user.userId, roomId);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Post('history/:roomId/rematch')
  async requestRematch(
    @Req() req: Request,
    @Param('roomId') roomId: string,
    @Body() dto: HistoryRematchDto,
  ): Promise<{
    room: Awaited<ReturnType<GamesService['createRematchFromHistory']>>;
  }> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }

    const participantIds = Array.isArray(dto.participantIds)
      ? dto.participantIds
      : [];

    const room = await this.gamesService.createRematchFromHistory(
      user.userId,
      roomId,
      participantIds,
      {
        gameId: dto.gameId,
        name: dto.name,
        visibility: dto.visibility,
        gameOptions: dto.gameOptions,
        message: dto.message,
      },
    );

    return { room };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('history/:roomId')
  @HttpCode(204)
  async removeHistoryEntry(
    @Req() req: Request,
    @Param('roomId') roomId: string,
  ): Promise<void> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }

    await this.gamesService.hideHistoryEntry(user.userId, roomId);
  }
}
