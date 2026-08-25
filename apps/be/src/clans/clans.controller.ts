import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { ClansService } from './clans.service';
import { CreateClanDto } from './dto/create-clan.dto';
import { UpdateClanDto } from './dto/update-clan.dto';
import { JoinClanDto } from './dto/join-clan.dto';
import { SetMemberRoleDto } from './dto/set-member-role.dto';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

interface RequestWithUser {
  user: AuthenticatedUser;
}

@Controller('clans')
@UseGuards(JwtAuthGuard)
export class ClansController {
  constructor(private readonly clansService: ClansService) {}

  @Post()
  createClan(@Req() req: RequestWithUser, @Body() dto: CreateClanDto) {
    return this.clansService.createClan(req.user.userId, dto);
  }

  @Get('me')
  getMyClan(@Req() req: RequestWithUser) {
    return this.clansService.getUserClan(req.user.userId);
  }

  @Get('popular')
  getPopularClans(@Query('limit') limit?: string) {
    return this.clansService.getPopularClans(limit ? parseInt(limit, 10) : 20);
  }

  @Get('search')
  searchClans(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.clansService.searchClans(
      query ?? '',
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('invite/:code')
  getClanByInviteCode(@Param('code') code: string) {
    return this.clansService.getClanByInviteCode(code);
  }

  @Get(':id')
  getClan(@Param('id') id: string) {
    return this.clansService.getClanById(id);
  }

  @Get(':id/members')
  getClanMembers(@Param('id') id: string) {
    return this.clansService.getClanMembers(id);
  }

  @Patch(':id')
  updateClan(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateClanDto,
  ) {
    return this.clansService.updateClan(req.user.userId, id, dto);
  }

  @Post('join')
  @HttpCode(HttpStatus.NO_CONTENT)
  joinClan(@Req() req: RequestWithUser, @Body() dto: JoinClanDto) {
    return this.clansService.joinClan(req.user.userId, dto.clanId);
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  leaveClan(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.clansService.leaveClan(req.user.userId, id);
  }

  @Post(':id/remove/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.clansService.removeMember(req.user.userId, id, userId);
  }

  // Clan invites are not implemented — the join flow uses invite codes via
  // POST /clans/join and GET /clans/invite/:code. The previous stub route
  // was removed rather than left half-wired.
  @Post(':id/role/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  setMemberRole(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: SetMemberRoleDto,
  ) {
    return this.clansService.setMemberRole(
      req.user.userId,
      id,
      userId,
      dto.role,
    );
  }

  @Post(':id/regenerate-code')
  regenerateInviteCode(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.clansService.regenerateInviteCode(req.user.userId, id);
  }
}
