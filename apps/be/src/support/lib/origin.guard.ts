import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
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
@Injectable()
export class OriginGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
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
    throw new ForbiddenException('origin not allowed');
  }
}
