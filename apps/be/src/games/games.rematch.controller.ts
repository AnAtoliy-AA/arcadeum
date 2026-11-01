import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtOptionalAuthGuard } from '../auth/jwt/jwt-optional.guard';
import { type AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { GamesRematchService } from './games.rematch.service';
import { InvitePlayersDto } from './dtos/invite-players.dto';

@Controller('games')
export class GamesRematchController {
  constructor(private readonly rematchService: GamesRematchService) {}

  @UseGuards(JwtOptionalAuthGuard)
  @Post('rooms/:roomId/invitation/accept')
  @HttpCode(204)
  async acceptInvitation(
    @Req() req: Request,
    @Param('roomId') roomId: string,
  ): Promise<void> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    await this.rematchService.acceptInvitation(roomId, user.userId);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Post('rooms/:roomId/invitation/decline')
  @HttpCode(204)
  async declineInvitation(
    @Req() req: Request,
    @Param('roomId') roomId: string,
  ): Promise<void> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    await this.rematchService.declineInvitation(roomId, user.userId);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Post('rooms/:roomId/invitation/block')
  @HttpCode(204)
  async blockRematchRoom(
    @Req() req: Request,
    @Param('roomId') roomId: string,
  ): Promise<void> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    await this.rematchService.blockRematchRoom(roomId, user.userId);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Post('rooms/:roomId/invitation/cancel')
  @HttpCode(204)
  async cancelInvitation(
    @Req() req: Request,
    @Param('roomId') roomId: string,
  ): Promise<void> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new UnauthorizedException();
    await this.rematchService.cancelInvitation(roomId, user.userId);
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
    if (!user) throw new UnauthorizedException();
    await this.rematchService.reinvitePlayers(roomId, user.userId, dto.userIds);
  }
}
