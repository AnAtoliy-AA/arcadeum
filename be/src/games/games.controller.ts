import {
  Body,
  Controller,
  Get,
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
import {
  GamesService,
  type StartExplodingCatsSessionResult,
} from './games.service';
import { CreateGameRoomDto } from './dtos/create-game-room.dto';
import { JoinGameRoomDto } from './dtos/join-game-room.dto';
import { StartGameDto } from './dtos/start-game.dto';
import { LeaveGameRoomDto } from './dtos/leave-game-room.dto';
import { DeleteGameRoomDto } from './dtos/delete-game-room.dto';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

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
  ): Promise<{ rooms: Awaited<ReturnType<GamesService['listRooms']>> }> {
    const user = req.user as AuthenticatedUser | undefined | null;
    const rooms = await this.gamesService.listRooms(user?.userId, gameId);
    return { rooms };
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
  ): Promise<{ session: Awaited<ReturnType<GamesService['getRoomSession']>> }> {
    const user = req.user as AuthenticatedUser | undefined | null;
    const session = await this.gamesService.getRoomSession(
      roomId,
      user?.userId,
    );
    return { session };
  }

  @UseGuards(JwtAuthGuard)
  @Post('rooms/join')
  async joinRoom(
    @Req() req: Request,
    @Body() dto: JoinGameRoomDto,
  ): Promise<{ room: Awaited<ReturnType<GamesService['joinRoom']>> }> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }

    const room = await this.gamesService.joinRoom(user.userId, dto);
    return { room };
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

    return this.gamesService.startExplodingCatsSession(
      user.userId,
      dto.roomId,
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

    return this.gamesService.leaveRoom(user.userId, dto.roomId);
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

    const result = await this.gamesService.deleteRoom(user.userId, dto.roomId);
    return result;
  }
}
