import {
  Body,
  Controller,
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
import { GamesCatalogService } from './games-catalog.service';
import {
  type StartCriticalSessionResult,
  type CatalogResponse,
} from './games.types';
import { SyncStatsDto } from './dtos/sync-stats.dto';
import { CreateGameRoomDto } from './dtos/create-game-room.dto';
import { JoinGameRoomDto } from './dtos/join-game-room.dto';
import { StartGameDto } from './dtos/start-game.dto';
import { LeaveGameRoomDto } from './dtos/leave-game-room.dto';
import { DeleteGameRoomDto } from './dtos/delete-game-room.dto';
import { QuickplayGameDto } from './dtos/quickplay-game.dto';
import { CreateAiVsAiGameDto } from './dtos/create-ai-vs-ai.dto';
import { AiVsAiService } from './ai-vs-ai/ai-vs-ai.service';
import { RoomInfoDto } from './dtos/room-info.dto';
import { UpdateRoomOptionsDto } from './dtos/update-room-options.dto';
import { InvitePlayersDto } from './dtos/invite-players.dto';
import { ReorderParticipantsDto } from './dtos/reorder-participants.dto';
import {
  parseStatusFilters,
  parseVisibilityFilters,
  parseParticipationFilter,
} from './games.query-parsers';
import { extractVariantFromOptions } from './game-options';
import { CriticalService } from './critical/critical.service';
import { TexasHoldemService } from './texas-holdem/texas-holdem.service';

@Controller('games')
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly catalogService: GamesCatalogService,
    private readonly criticalService: CriticalService,
    private readonly texasHoldemService: TexasHoldemService,
    private readonly aiVsAiService: AiVsAiService,
  ) {}

  @UseGuards(JwtOptionalAuthGuard)
  @Get('catalog')
  async getCatalog(@Req() req: Request): Promise<CatalogResponse> {
    const user = req.user as AuthenticatedUser | undefined | null;
    return this.catalogService.getCatalog(user?.userId);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get('my-room-count')
  async getMyRoomCount(
    @Req() req: Request,
  ): Promise<{ count: number; nextRoomNumber: number }> {
    const user = req.user as AuthenticatedUser | undefined | null;
    if (!user?.userId) {
      return { count: 0, nextRoomNumber: 1 };
    }
    const count = await this.gamesService.countHostRooms(user.userId);
    return { count, nextRoomNumber: count + 1 };
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Post('rooms')
  async createRoom(
    @Req() req: Request,
    @Body() dto: CreateGameRoomDto,
  ): Promise<{ room: Awaited<ReturnType<GamesService['createRoom']>> }> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }

    const role = await this.catalogService.resolveRole(user.userId);
    const variant = extractVariantFromOptions(dto.gameOptions);
    await this.catalogService.assertVisible(role, dto.gameId, variant);

    if (dto.gameOptions) {
      const ruleMap = await this.catalogService.getRulesForGame(dto.gameId);
      this.catalogService.stripDisabledRules(dto.gameOptions, ruleMap);
    }

    const room = await this.gamesService.createRoom(user.userId, dto);
    return { room };
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Post('quickplay')
  async quickplay(@Req() req: Request, @Body() dto: QuickplayGameDto) {
    const user = req.user as AuthenticatedUser | null;
    if (!user) {
      throw new BadRequestException('Missing user context');
    }
    const role = await this.catalogService.resolveRole(user.userId);
    await this.catalogService.assertVisible(role, dto.gameId, dto.variant);
    const room =
      dto.mode === 'human'
        ? await this.gamesService.findHumanMatch(
            user.userId,
            dto.gameId,
            dto.variant,
            dto.theme,
          )
        : await this.gamesService.quickplay(
            user.userId,
            dto.gameId,
            dto.variant,
            dto.theme,
          );
    return { room };
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Post('ai-vs-ai')
  async createAiVsAi(@Req() req: Request, @Body() dto: CreateAiVsAiGameDto) {
    const user = req.user as AuthenticatedUser | null;
    if (!user) {
      throw new BadRequestException('Missing user context');
    }
    const role = await this.catalogService.resolveRole(user.userId);
    await this.catalogService.assertVisible(role, dto.gameId, dto.variant);
    const room = await this.aiVsAiService.createAIvsAIRoom(user.userId, dto);
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
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('aiVsAi') aiVsAi?: string,
  ): Promise<Awaited<ReturnType<GamesService['listRooms']>>> {
    const user = req.user as AuthenticatedUser | undefined | null;
    const statusFilters = parseStatusFilters(statusParam);
    const visibilityFilters = parseVisibilityFilters(visibilityParam);
    const participationFilter = parseParticipationFilter(participationParam);

    const pageNum = page ? parseInt(page, 10) : 0;
    const limitNum = limit ? parseInt(limit, 10) : 12;

    const result = await this.gamesService.listRooms({
      userId: user?.userId,
      gameId,
      search: search?.trim(),
      statuses: statusFilters.length ? statusFilters : undefined,
      visibility: visibilityFilters.length ? visibilityFilters : undefined,
      participation: participationFilter,
      aiVsAi: aiVsAi === 'true',
      page: pageNum,
      limit: limitNum,
    });

    const role = await this.catalogService.resolveRole(user?.userId);
    const filtered = await this.catalogService.filterVisible(
      role,
      result.rooms,
      (r) => ({
        gameId: r.gameId,
        variantId: extractVariantFromOptions(r.gameOptions),
      }),
    );
    return { ...result, rooms: filtered };
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get('rooms/by-code/:code')
  async findRoomByInviteCode(
    @Req() req: Request,
    @Param('code') code: string,
  ): Promise<{ room: Awaited<ReturnType<GamesService['getRoom']>> }> {
    const user = req.user as AuthenticatedUser | undefined | null;
    const room = await this.gamesService.findRoomByInviteCode(
      code,
      user?.userId,
    );
    return { room };
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Post('room-info')
  async getRoomInfoBody(
    @Req() req: Request,
    @Body() dto: RoomInfoDto,
  ): Promise<{
    room: Awaited<ReturnType<GamesService['getRoom']>>;
    session: Awaited<ReturnType<GamesService['getRoomSession']>>['session'];
  }> {
    const user = req.user as AuthenticatedUser | undefined | null;
    const { room, session } = await this.gamesService.getRoomSession(
      dto.roomId,
      user?.userId,
    );
    return { room, session };
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
  @Get('stats')
  async listStats(@Req() req: Request) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.gamesService.getPlayerStats(user.userId);
  }
  @UseGuards(JwtAuthGuard)
  @Post('stats')
  async syncStats(@Req() req: Request, @Body() dto: SyncStatsDto) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.gamesService.syncPlayerStats(user.userId, dto.records);
  }
  @Get('leaderboard')
  async getLeaderboard(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('gameId') gameId?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    return this.gamesService.getLeaderboard(
      limitNum,
      offsetNum,
      gameId || undefined,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats/head-to-head')
  async getHeadToHead(
    @Req() req: Request,
    @Query('userId2') userId2: string,
    @Query('gameId') gameId?: string,
  ) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    if (!userId2) throw new BadRequestException('userId2 is required');
    return this.gamesService.getHeadToHead(
      user.userId,
      userId2,
      gameId || undefined,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats/trends')
  async getTrends(
    @Req() req: Request,
    @Query('gameId') gameId?: string,
    @Query('limit') limit?: string,
  ) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.gamesService.getTrends(
      user.userId,
      gameId || undefined,
      limitNum,
    );
  }
  @UseGuards(JwtOptionalAuthGuard)
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
  @UseGuards(JwtOptionalAuthGuard)
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
  @UseGuards(JwtOptionalAuthGuard)
  @Post('rooms/:roomId/invitation/invite')
  @HttpCode(204)
  async invitePlayers(
    @Req() req: Request,
    @Param('roomId') roomId: string,
    @Body() dto: InvitePlayersDto,
  ): Promise<void> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }

    await this.gamesService.reinvitePlayers(roomId, user.userId, dto.userIds);
  }

  @UseGuards(JwtOptionalAuthGuard)
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
  @UseGuards(JwtOptionalAuthGuard)
  @Post('rooms/start')
  async startRoom(
    @Req() req: Request,
    @Body() dto: StartGameDto,
  ): Promise<StartCriticalSessionResult> {
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
      );
    }

    // Default to Critical (legacy behavior)
    return this.criticalService.startSession(
      user.userId,
      roomId,
      undefined,
      undefined,
      dto.engine,
    );
  }
  @UseGuards(JwtOptionalAuthGuard)
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
  @UseGuards(JwtOptionalAuthGuard)
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
  @UseGuards(JwtOptionalAuthGuard)
  @Post('rooms/:roomId/options') // Using POST/PATCH interchangeably preference
  async updateRoomOptions(
    @Req() req: Request,
    @Param('roomId') roomId: string,
    @Body() dto: UpdateRoomOptionsDto,
  ): Promise<{
    room: Awaited<ReturnType<GamesService['updateRoomOptions']>>;
  }> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }

    const room = await this.gamesService.updateRoomOptions(
      roomId,
      user.userId,
      dto.options,
    );
    return { room };
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('rooms/:roomId/participants') // Using POST over PATCH for easier implementation
  async reorderParticipants(
    @Req() req: Request,
    @Param('roomId') roomId: string,
    @Body() dto: ReorderParticipantsDto,
  ): Promise<{
    room: Awaited<ReturnType<GamesService['reorderParticipants']>>;
  }> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }

    const room = await this.gamesService.reorderParticipants(
      roomId,
      user.userId,
      dto.userIds,
    );
    return { room };
  }
}
