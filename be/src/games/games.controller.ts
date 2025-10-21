import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { type AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import {
  GamesService,
  type StartExplodingCatsSessionResult,
} from './games.service';
import { CreateGameRoomDto } from './dtos/create-game-room.dto';
import { JoinGameRoomDto } from './dtos/join-game-room.dto';
import { StartGameDto } from './dtos/start-game.dto';
import { LeaveGameRoomDto } from './dtos/leave-game-room.dto';

@Controller('games')
@UseGuards(JwtAuthGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

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

  @Get('rooms')
  async listRooms(
    @Req() req: Request,
    @Query('gameId') gameId?: string,
  ): Promise<{ rooms: Awaited<ReturnType<GamesService['listRooms']>> }> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }

    const rooms = await this.gamesService.listRooms(user.userId, gameId);
    return { rooms };
  }

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
}
