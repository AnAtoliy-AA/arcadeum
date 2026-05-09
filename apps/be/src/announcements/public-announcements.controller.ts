import {
  Controller,
  Get,
  Headers,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtOptionalAuthGuard } from '../auth/jwt/jwt-optional.guard';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { AnnouncementsService } from './announcements.service';
import { ActiveAnnouncementDto } from './dto/active-announcement.dto';
import {
  ANNOUNCEMENT_LOCALES,
  type AnnouncementLocale,
} from './schemas/announcement.schema';
import type { AnnouncementPublicItem } from './interfaces/announcement.interface';

interface RequestWithUser {
  user?: AuthenticatedUser | null;
}

const LOCALE_SET = new Set<AnnouncementLocale>(ANNOUNCEMENT_LOCALES);

function pickLocaleFromHeader(
  acceptLanguage: string | undefined,
): AnnouncementLocale {
  if (!acceptLanguage) return 'en';
  const langs = acceptLanguage
    .split(',')
    .map((s) => s.split(';')[0]?.trim().toLowerCase().slice(0, 2) ?? '');
  for (const lang of langs) {
    if (LOCALE_SET.has(lang as AnnouncementLocale)) {
      return lang as AnnouncementLocale;
    }
  }
  return 'en';
}

function isAuthenticatedUser(
  user: AuthenticatedUser | null | undefined,
): boolean {
  if (!user) return false;
  // The optional guard returns synthetic anonymous users with userId starting
  // with 'anon_' for x-anonymous-id header callers. Treat those as not
  // authenticated for audience-filter purposes.
  if (typeof user.userId === 'string' && user.userId.startsWith('anon_')) {
    return false;
  }
  return true;
}

@Controller('announcements')
@UseGuards(JwtOptionalAuthGuard)
export class PublicAnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}

  @Get('active')
  async active(
    @Query() query: ActiveAnnouncementDto,
    @Headers('accept-language') acceptLanguage: string | undefined,
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ announcement: AnnouncementPublicItem | null }> {
    const locale = query.locale ?? pickLocaleFromHeader(acceptLanguage);
    res.setHeader(
      'Cache-Control',
      'private, max-age=30, stale-while-revalidate=60',
    );
    const announcement = await this.service.getActiveForCaller(
      isAuthenticatedUser(req.user),
      locale,
    );
    return { announcement };
  }
}
