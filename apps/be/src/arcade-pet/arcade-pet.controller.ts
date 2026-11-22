import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import type {
  ArcadePetCollectionResponse,
  ArcadePetEconomyResult,
  SyncArcadePetCollectionResult,
} from '@arcadeum/games-core';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { ArcadePetCollectionService } from './arcade-pet-collection.service';
import {
  ArcadePetEconomyService,
  toEconomyAction,
} from './arcade-pet-economy.service';
import {
  EconomyActionDto,
  SyncCollectionDto,
} from './dto/arcade-pet-collection.dto';

/** Per-IP budgets on top of the global limiter (gifts also hit user lookups). */
const SYNC_THROTTLE = { default: { limit: 60, ttl: 60_000 } };
const ACTION_THROTTLE = { default: { limit: 20, ttl: 60_000 } };

function requireUser(req: Request): AuthenticatedUser {
  // JwtAuthGuard stores the validated payload on `req.user`; Express types it
  // as an untyped `User`, so it is narrowed to the strategy's payload here.
  const user = req.user as AuthenticatedUser | undefined;
  if (!user) throw new UnauthorizedException();
  return user;
}

@Controller('arcade-pet')
@UseGuards(JwtAuthGuard)
export class ArcadePetController {
  constructor(
    private readonly collections: ArcadePetCollectionService,
    private readonly economy: ArcadePetEconomyService,
  ) {}

  @Get('collection')
  getCollection(@Req() req: Request): Promise<ArcadePetCollectionResponse> {
    return this.collections.getCollection(requireUser(req).userId);
  }

  @Put('collection')
  @Throttle(SYNC_THROTTLE)
  syncCollection(
    @Req() req: Request,
    @Body() dto: SyncCollectionDto,
  ): Promise<SyncArcadePetCollectionResult> {
    return this.collections.syncCollection(requireUser(req).userId, dto);
  }

  /**
   * Domain rejections (insufficient gems, unknown recipient, ...) return 200
   * with `ok: false` on purpose: the client needs the authoritative
   * collection in the same response to roll back its optimistic update.
   */
  @Post('collection/action')
  @Throttle(ACTION_THROTTLE)
  performAction(
    @Req() req: Request,
    @Body() dto: EconomyActionDto,
  ): Promise<ArcadePetEconomyResult> {
    const action = toEconomyAction(dto);
    if (!action) throw new BadRequestException('Invalid pet action');
    return this.economy.perform(requireUser(req).userId, action);
  }
}
