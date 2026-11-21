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
import type { Request } from 'express';
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

function requireUser(req: Request): AuthenticatedUser {
  const user = req.user as AuthenticatedUser | undefined;
  if (!user) throw new UnauthorizedException();
  return user;
}

@Controller('arcade-pet')
export class ArcadePetController {
  constructor(
    private readonly collections: ArcadePetCollectionService,
    private readonly economy: ArcadePetEconomyService,
  ) {}

  @Get('collection')
  @UseGuards(JwtAuthGuard)
  getCollection(@Req() req: Request) {
    return this.collections.getCollection(requireUser(req).userId);
  }

  @Put('collection')
  @UseGuards(JwtAuthGuard)
  syncCollection(@Req() req: Request, @Body() dto: SyncCollectionDto) {
    return this.collections.syncCollection(requireUser(req).userId, dto);
  }

  @Post('collection/action')
  @UseGuards(JwtAuthGuard)
  performAction(@Req() req: Request, @Body() dto: EconomyActionDto) {
    const action = toEconomyAction(dto);
    if (!action) throw new BadRequestException('Invalid pet action');
    return this.economy.perform(requireUser(req).userId, action);
  }
}
