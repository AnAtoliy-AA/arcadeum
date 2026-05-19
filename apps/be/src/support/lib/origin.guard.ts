import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { getAllowedOrigins } from '../../common/utils/cors.util';

// Server-side origin check. CORS preflight protects browsers but is not
// enforced for direct curl/server-to-server POSTs — this guard rejects
// any request whose Origin or Referer doesn't match an allowed web origin.
@Injectable()
export class OriginGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();
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
