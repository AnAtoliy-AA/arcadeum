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
import {
  type StartCriticalSessionResult,
  type CatalogResponse,
  type CatalogGame,
  type CatalogVariant,
} from './games.types';
import { CreateGameRoomDto } from './dtos/create-game-room.dto';
import { JoinGameRoomDto } from './dtos/join-game-room.dto';
import { StartGameDto } from './dtos/start-game.dto';
import { LeaveGameRoomDto } from './dtos/leave-game-room.dto';
import { DeleteGameRoomDto } from './dtos/delete-game-room.dto';
import { QuickplayGameDto } from './dtos/quickplay-game.dto';
import {
  parseStatusFilters,
  parseVisibilityFilters,
  parseParticipationFilter,
} from './games.query-parsers';

import { CriticalService } from './critical/critical.service';
import { TexasHoldemService } from './texas-holdem/texas-holdem.service';
import { GameVisibilityService } from '../admin/game-visibility/game-visibility.service';
import { GameRuleVisibilityService } from '../admin/game-visibility/game-rule-visibility.service';
import { UserRoleResolver } from '../auth/lib/user-role-resolver.service';
import { GAME_CATALOG } from './games.catalog';
import { extractVariantFromOptions } from './game-options';

@Controller('games')
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly criticalService: CriticalService,
    private readonly texasHoldemService: TexasHoldemService,
    private readonly visibility: GameVisibilityService,
    private readonly ruleVisibility: GameRuleVisibilityService,
    private readonly roleResolver: UserRoleResolver,
  ) {}

  @UseGuards(JwtOptionalAuthGuard)
  @Get('catalog')
  async getCatalog(@Req() req: Request): Promise<CatalogResponse> {
    const user = req.user as AuthenticatedUser | undefined | null;
    const role = await this.roleResolver.resolveRole(user?.userId);
    const allRuleMaps = await this.ruleVisibility.getAllRules();
    const games: CatalogGame[] = [];
    for (const entry of GAME_CATALOG) {
      const visible = await this.visibility.canSee(role, entry.gameId);
      if (!visible) {
        games.push({
          gameId: entry.gameId,
          comingSoon: true,
          variants: [],
          rules: entry.rules.map((r) => ({
            ruleId: r.ruleId,
            comingSoon: true,
          })),
        });
        continue;
      }

      const variants: CatalogVariant[] = [];
      for (const v of entry.variants) {
        const visible = await this.visibility.canSee(role, entry.gameId, v);
        variants.push({ id: v, comingSoon: !visible });
      }

      const ruleMap = allRuleMaps.get(entry.gameId);
      const rules = entry.rules.map((r) => ({
        ruleId: r.ruleId,
        comingSoon: ruleMap ? !ruleMap.get(r.ruleId) : false,
      }));

      games.push({
        gameId: entry.gameId,
        comingSoon: false,
        variants,
        rules,
      });
    }
    return { games };
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

    const role = await this.roleResolver.resolveRole(user.userId);
    const variant = extractVariantFromOptions(dto.gameOptions);
    await this.visibility.assertVisible(role, dto.gameId, variant);

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
    const role = await this.roleResolver.resolveRole(user.userId);
    await this.visibility.assertVisible(role, dto.gameId, dto.variant);
    const room =
      dto.mode === 'human'
        ? await this.gamesService.findHumanMatch(
            user.userId,
            dto.gameId,
            dto.variant,
          )
        : await this.gamesService.quickplay(
            user.userId,
            dto.gameId,
            dto.variant,
          );
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
      page: pageNum,
      limit: limitNum,
    });

    const role = await this.roleResolver.resolveRole(user?.userId);
    const filtered = await this.visibility.filterVisible(
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
    @Body() body: { roomId: string },
  ): Promise<{ room: Awaited<ReturnType<GamesService['getRoom']>> }> {
    const { roomId } = body;
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
  @Get('stats')
  async listStats(@Req() req: Request) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.gamesService.getPlayerStats(user.userId);
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
      ) as Promise<StartCriticalSessionResult>;
    }

    // Default to Critical (legacy behavior)
    return this.criticalService.startSession(user.userId, roomId, dto.engine);
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
    @Body() body: { options: Record<string, unknown> },
  ): Promise<{
    room: Awaited<ReturnType<GamesService['updateRoomOptions']>>;
  }> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }

    const { options } = body;
    if (!options || typeof options !== 'object') {
      throw new BadRequestException('Options object is required');
    }

    const room = await this.gamesService.updateRoomOptions(
      roomId,
      user.userId,
      options,
    );
    return { room };
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
