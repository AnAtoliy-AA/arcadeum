import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard';
import type { AuthenticatedUser } from '../../auth/jwt/jwt.strategy';
import { AsyncMatchService } from './async-match.service';
import { CreateAsyncMatchDto } from './dto/create-async-match.dto';
import { SubmitAsyncMoveDto } from './dto/submit-async-move.dto';

@Controller('games/async-matches')
@UseGuards(JwtAuthGuard)
export class AsyncMatchController {
  constructor(private readonly asyncMatchService: AsyncMatchService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateAsyncMatchDto) {
    const user = req.user as AuthenticatedUser;
    return this.asyncMatchService.createMatch(user.userId, dto);
  }

  @Get()
  async list(
    @Req() req: Request,
    @Query('status') status?: 'active' | 'completed' | 'forfeited',
  ) {
    const user = req.user as AuthenticatedUser;
    return this.asyncMatchService.getUserMatches(user.userId, status);
  }

  @Get(':matchId')
  async get(@Req() req: Request, @Param('matchId') matchId: string) {
    const user = req.user as AuthenticatedUser;
    return this.asyncMatchService.getMatchById(user.userId, matchId);
  }

  @Post(':matchId/move')
  async submitMove(
    @Req() req: Request,
    @Param('matchId') matchId: string,
    @Body() dto: SubmitAsyncMoveDto,
  ) {
    const user = req.user as AuthenticatedUser;
    return this.asyncMatchService.submitMove(user.userId, matchId, dto);
  }

  @Post(':matchId/forfeit')
  async forfeit(@Req() req: Request, @Param('matchId') matchId: string) {
    const user = req.user as AuthenticatedUser;
    return this.asyncMatchService.forfeitMatch(user.userId, matchId);
  }
}
