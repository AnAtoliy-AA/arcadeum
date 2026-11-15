import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { JwtOptionalAuthGuard } from '../auth/jwt/jwt-optional.guard';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { TournamentsService } from './tournaments.service';
import { TournamentsBracketsService } from './tournaments.brackets.service';
import { ListPublicTournamentsDto } from './dto/list-public-tournaments.dto';
import {
  TOURNAMENT_LOCALES,
  type TournamentLocale,
} from './schemas/tournament.schema';
import type { PublicTournamentsListResponse } from './interfaces/tournament.interface';

import { SeaBattleBlitzService } from './sea-battle-blitz/sea-battle-blitz.service';
import type { SeaBattleBlitzCupResponse } from './sea-battle-blitz/sea-battle-blitz.types';

interface RequestWithUser {
  user?: AuthenticatedUser | null;
}

const LOCALE_SET = new Set<TournamentLocale>(TOURNAMENT_LOCALES);

function pickLocaleFromHeader(
  acceptLanguage: string | undefined,
): TournamentLocale {
  if (!acceptLanguage) return 'en';
  const langs = acceptLanguage
    .split(',')
    .map((s) => s.split(';')[0]?.trim().toLowerCase().slice(0, 2) ?? '');
  for (const lang of langs) {
    if (LOCALE_SET.has(lang as TournamentLocale)) {
      return lang as TournamentLocale;
    }
  }
  return 'en';
}

function isAuthenticatedUser(
  user: AuthenticatedUser | null | undefined,
): boolean {
  if (!user) return false;
  if (typeof user.userId === 'string' && user.userId.startsWith('anon_')) {
    return false;
  }
  return true;
}

@Controller('tournaments')
export class PublicTournamentsController {
  constructor(
    private readonly service: TournamentsService,
    private readonly bracketsService: TournamentsBracketsService,
    private readonly blitzService: SeaBattleBlitzService,
  ) {}

  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  async list(
    @Query() query: ListPublicTournamentsDto,
    @Headers('accept-language') acceptLanguage: string | undefined,
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicTournamentsListResponse> {
    const locale = query.locale ?? pickLocaleFromHeader(acceptLanguage);
    const isAuthenticated = isAuthenticatedUser(req.user);
    res.setHeader(
      'Cache-Control',
      'public, max-age=60, stale-while-revalidate=300',
    );
    return this.service.listPublic(
      locale,
      isAuthenticated,
      isAuthenticated ? req.user?.userId : undefined,
      query.gameType,
    );
  }

  @Get('sea-battle/blitz-cup')
  @UseGuards(JwtOptionalAuthGuard)
  async getSeaBattleBlitzCup(
    @Query() query: ListPublicTournamentsDto,
    @Headers('accept-language') acceptLanguage: string | undefined,
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SeaBattleBlitzCupResponse> {
    const locale = query.locale ?? pickLocaleFromHeader(acceptLanguage);
    const isAuthenticated = isAuthenticatedUser(req.user);
    res.setHeader(
      'Cache-Control',
      'public, max-age=15, stale-while-revalidate=60',
    );
    return this.blitzService.getSeaBattleBlitzCup(
      locale,
      isAuthenticated,
      isAuthenticated ? req.user?.userId : undefined,
    );
  }

  @Get(':id/bracket')
  @UseGuards(JwtOptionalAuthGuard)
  async getBracket(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader(
      'Cache-Control',
      'public, max-age=60, stale-while-revalidate=300',
    );
    return this.bracketsService.getPublicBracket(id);
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  register(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<{ ok: true; waitlist: boolean }> {
    if (!isAuthenticatedUser(req.user)) {
      throw new ForbiddenException({ code: 'AUTHENTICATION_REQUIRED' });
    }
    return this.service.register(
      id,
      req.user?.userId ?? '',
      req.user?.username ?? null,
    );
  }

  @Delete(':id/register')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  unregister(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<void> {
    if (!isAuthenticatedUser(req.user)) {
      throw new ForbiddenException({ code: 'AUTHENTICATION_REQUIRED' });
    }
    return this.service.unregister(id, req.user?.userId ?? '');
  }
}
