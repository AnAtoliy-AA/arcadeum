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
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { JwtOptionalAuthGuard } from '../auth/jwt/jwt-optional.guard';
import { type AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { GamesService } from './games.service';
import {
  GAME_ROOM_PARTICIPATION_FILTERS,
  type GameRoomParticipationFilter,
  type StartExplodingCatsSessionResult,
} from './games.types';
import { CreateGameRoomDto } from './dtos/create-game-room.dto';
import { JoinGameRoomDto } from './dtos/join-game-room.dto';
import { StartGameDto } from './dtos/start-game.dto';
import { LeaveGameRoomDto } from './dtos/leave-game-room.dto';
import { DeleteGameRoomDto } from './dtos/delete-game-room.dto';
import { HistoryRematchDto } from './dtos/history-rematch.dto';
import {
  GAME_ROOM_STATUS_VALUES,
  GAME_ROOM_VISIBILITY_VALUES,
  type GameRoomStatus,
  type GameRoomVisibility,
} from './schemas/game-room.schema';

import { ExplodingCatsService } from './exploding-cats/exploding-cats.service';
import { TexasHoldemService } from './texas-holdem/texas-holdem.service';

@Controller('games')
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly explodingCatsService: ExplodingCatsService,
    private readonly texasHoldemService: TexasHoldemService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('rooms')
  async createRoom(
    @Req() req: Request,
    @Body() dto: CreateGameRoomDto,
  ): Promise<{ room: Awaited<ReturnType<GamesService['createRoom']>> }> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }

    const room = await this.gamesService.createRoom(user.userId, dto);
    return { room };
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get('rooms')
  async listRooms(
    @Req() req: Request,
    @Query('gameId') gameId?: string,
    @Query('status') statusParam?: string,
    @Query('visibility') visibilityParam?: string,
    @Query('participation') participationParam?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<Awaited<ReturnType<GamesService['listRooms']>>> {
    const user = req.user as AuthenticatedUser | undefined | null;
    const parseList = (value?: string): string[] => {
      if (!value) {
        return [];
      }
      return value
        .split(',')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
    };

    const statusFilters = parseList(statusParam).reduce<GameRoomStatus[]>(
      (acc, value) => {
        if (
          GAME_ROOM_STATUS_VALUES.includes(value as GameRoomStatus) &&
          !acc.includes(value as GameRoomStatus)
        ) {
          acc.push(value as GameRoomStatus);
        }
        return acc;
      },
      [],
    );

    const visibilityFilters = parseList(visibilityParam).reduce<
      GameRoomVisibility[]
    >((acc, value) => {
      if (
        GAME_ROOM_VISIBILITY_VALUES.includes(value as GameRoomVisibility) &&
        !acc.includes(value as GameRoomVisibility)
      ) {
        acc.push(value as GameRoomVisibility);
      }
      return acc;
    }, []);

    let participationFilter: GameRoomParticipationFilter | undefined;
    if (typeof participationParam === 'string') {
      const trimmed = participationParam.trim();
      if (
        GAME_ROOM_PARTICIPATION_FILTERS.includes(
          trimmed as GameRoomParticipationFilter,
        )
      ) {
        participationFilter = trimmed as GameRoomParticipationFilter;
      }
    }

    if (participationFilter === 'all') {
      participationFilter = undefined;
    }

    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.gamesService.listRooms({
      userId: user?.userId,
      gameId,
      statuses: statusFilters.length ? statusFilters : undefined,
      visibility: visibilityFilters.length ? visibilityFilters : undefined,
      participation: participationFilter,
      page: pageNum,
      limit: limitNum,
    });
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get('rooms/:roomId')
  async getRoom(
    @Req() req: Request,
    @Param('roomId') roomId: string,
  ): Promise<{ room: Awaited<ReturnType<GamesService['getRoom']>> }> {
    const user = req.user as AuthenticatedUser | undefined | null;
    const room = await this.gamesService.getRoom(roomId, user?.userId);
    return { room };
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get('rooms/:roomId/session')
  async getRoomSession(
    @Req() req: Request,
    @Param('roomId') roomId: string,
  ): Promise<{
    session: Awaited<ReturnType<GamesService['getRoomSession']>>['session'];
  }> {
    const user = req.user as AuthenticatedUser | undefined | null;
    const { session } = await this.gamesService.getRoomSession(
      roomId,
      user?.userId,
    );
    return { session };
  }

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

    const pageNum = page ? parseInt(page, 10) : 1;
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

  @UseGuards(JwtAuthGuard)
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

    // Note: GamesService handles socket emission internally for rematch
    // So we just return the new room ID
    const newRoomId = room;

    return { room: newRoomId };
  }

  @UseGuards(JwtAuthGuard)
  @Post('rooms/:roomId/invitation/decline')
  @HttpCode(204)
  async declineInvitation(
    @Req() req: Request,
    @Param('roomId') roomId: string,
  ): Promise<void> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }

    await this.gamesService.declineInvitation(roomId, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('rooms/:roomId/invitation/block')
  @HttpCode(204)
  async blockRematchRoom(
    @Req() req: Request,
    @Param('roomId') roomId: string,
  ): Promise<void> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }

    await this.gamesService.blockRematchRoom(roomId, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('rooms/:roomId/invitation/invite')
  @HttpCode(204)
  async invitePlayers(
    @Req() req: Request,
    @Param('roomId') roomId: string,
    @Body() dto: { userIds: string[] },
  ): Promise<void> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }

    if (
      !dto.userIds ||
      !Array.isArray(dto.userIds) ||
      dto.userIds.length === 0
    ) {
      throw new BadRequestException('userIds array is required');
    }

    await this.gamesService.reinvitePlayers(roomId, user.userId, dto.userIds);
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

  @UseGuards(JwtAuthGuard)
  @Post('rooms/join')
  async joinRoom(
    @Req() req: Request,
    @Body() dto: JoinGameRoomDto,
  ): Promise<{ room: Awaited<ReturnType<GamesService['joinRoom']>>['room'] }> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }

    const result = await this.gamesService.joinRoom(dto, user.userId);
    return { room: result.room };
  }

  @UseGuards(JwtAuthGuard)
  @Post('rooms/start')
  async startRoom(
    @Req() req: Request,
    @Body() dto: StartGameDto,
  ): Promise<StartExplodingCatsSessionResult> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }

    // If roomId is missing, we need to find it (legacy behavior)
    const roomId = dto.roomId;
    let gameId: string | undefined;

    if (roomId) {
      const room = await this.gamesService.getRoom(roomId, user.userId);
      gameId = room.gameId;
    }

    // Route to appropriate service
    if (gameId === 'texas_holdem_v1') {
      return this.texasHoldemService.startSession(
        user.userId,
        roomId,
        dto.engine,
      ) as Promise<StartExplodingCatsSessionResult>;
    }

    // Default to Exploding Cats (legacy behavior)
    return this.explodingCatsService.startSession(
      user.userId,
      roomId,
      dto.engine,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('rooms/leave')
  leaveRoom(
    @Req() req: Request,
    @Body() dto: LeaveGameRoomDto,
  ): Promise<Awaited<ReturnType<GamesService['leaveRoom']>>> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.gamesService.leaveRoom(dto, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('rooms/delete')
  async deleteRoom(
    @Req() req: Request,
    @Body() dto: DeleteGameRoomDto,
  ): Promise<Awaited<ReturnType<GamesService['deleteRoom']>>> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }

    const result = await this.gamesService.deleteRoom(dto, user.userId);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('rooms/:roomId/participants') // Using POST over PATCH for easier implementation
  async reorderParticipants(
    @Req() req: Request,
    @Param('roomId') roomId: string,
    @Body() body: { userIds: string[] },
  ): Promise<{
    room: Awaited<ReturnType<GamesService['reorderParticipants']>>;
  }> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }

    const { userIds } = body;
    if (!Array.isArray(userIds)) {
      throw new BadRequestException('userIds must be an array');
    }

    const room = await this.gamesService.reorderParticipants(
      roomId,
      user.userId,
      userIds,
    );
    return { room };
  }
}
