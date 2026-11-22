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
import { ArcadePetEconomyException } from './arcade-pet-economy.exception';
import { ArcadePetFeatureGuard } from './arcade-pet-feature.guard';
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

/** Successful action outcome; rejections are thrown as HTTP errors. */
export type ArcadePetActionSuccess = Extract<
  ArcadePetEconomyResult,
  { ok: true }
>;

/**
 * Unversioned like every other controller (no global prefix or URI
 * versioning exists in this API), so the path is `/arcade-pet/...`.
 */
@Controller('arcade-pet')
@UseGuards(JwtAuthGuard, ArcadePetFeatureGuard)
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
   * Domain rejections map to real HTTP codes (see
   * ARCADE_PET_ERROR_HTTP_STATUS): 400 invalid, 402 insufficient funds, 404
   * unknown pet/present/recipient, 409 state conflicts. The error body still
   * carries the authoritative collection for client rollback. A retry with
   * the same `actionId` is answered with success, not applied twice.
   */
  @Post('collection/action')
  @Throttle(ACTION_THROTTLE)
  async performAction(
    @Req() req: Request,
    @Body() dto: EconomyActionDto,
  ): Promise<ArcadePetActionSuccess> {
    const action = toEconomyAction(dto);
    if (!action) throw new BadRequestException('Invalid pet action');
    const result = await this.economy.perform(
      requireUser(req).userId,
      action,
      dto.actionId,
    );
    if (!result.ok) {
      throw new ArcadePetEconomyException(result.error, result.collection);
    }
    return result;
  }
}
