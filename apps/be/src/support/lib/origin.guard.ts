import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { getAllowedOrigins } from '../../common/utils/cors.util';

// Browser submissions go through the Next.js server action, so by the time
// they reach this guard they're server-to-server fetches with no Origin or
// Referer header. We trust them via a shared secret instead — the web
// server includes X-Internal-Token, the BE checks it matches
// SUPPORT_INTERNAL_TOKEN. Browsers calling the BE directly (curl, future
// SDK callers, etc.) still get the origin/referer check, so the guard
// remains useful as a CORS-bypass blocker.
//
// In non-production environments where no token is configured, requests
// with no Origin/Referer are allowed (the dev/test BE is on localhost, and
// forcing every contributor to set up a shared secret just to run the form
// locally is overkill). Production MUST set SUPPORT_INTERNAL_TOKEN — the
// guard logs a startup warning if it's missing there.
@Injectable()
export class OriginGuard implements CanActivate {
  private readonly logger = new Logger(OriginGuard.name);
  private readonly warnedAboutMissingTokenInProd = (() => {
    if (
      process.env.NODE_ENV === 'production' &&
      !process.env.SUPPORT_INTERNAL_TOKEN
    ) {
      new Logger(OriginGuard.name).warn(
        'SUPPORT_INTERNAL_TOKEN is not set in production — contact form ' +
          'submissions via the Next.js server action will be rejected by ' +
          'OriginGuard. Set the same value on both web and BE.',
      );
    }
    return true;
  })();

  canActivate(ctx: ExecutionContext): boolean {
    void this.warnedAboutMissingTokenInProd;
    const req = ctx.switchToHttp().getRequest<Request>();
    const token = req.headers['x-internal-token'];
    const expected = process.env.SUPPORT_INTERNAL_TOKEN;
    if (expected && typeof token === 'string' && token === expected) {
      return true;
    }

    const origin = req.headers.origin;
    const referer = req.headers.referer;
    const allowed = getAllowedOrigins();
    if (origin && allowed.includes(origin)) return true;
    if (referer && allowed.some((o) => referer.startsWith(`${o}/`))) {
      return true;
    }

    // Dev convenience: when not in production AND no shared token is
    // configured, allow server-to-server fetches that have no Origin or
    // Referer (the Next.js server-action case). Production never takes
    // this path — token must be set there.
    if (
      process.env.NODE_ENV !== 'production' &&
      !expected &&
      !origin &&
      !referer
    ) {
      return true;
    }

    throw new ForbiddenException('origin not allowed');
  }
}
