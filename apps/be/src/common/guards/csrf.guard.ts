import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    if (SAFE_METHODS.has(req.method)) {
      return true;
    }

    // Primary: X-Requested-With header (blocks simple form submissions)
    const header = req.headers['x-requested-with'];
    if (typeof header === 'string' && header === 'XMLHttpRequest') {
      return true;
    }

    // Secondary: Origin/Referer check for state-changing requests
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    const host = req.headers.host;

    if (origin || referer) {
      const sourceUrl = origin || referer;
      if (!sourceUrl || !host) {
        throw new ForbiddenException('Missing CSRF validation');
      }

      try {
        const requestUrl = new URL(
          `${req.protocol}://${host}${req.originalUrl}`,
        );
        const parsed = new URL(sourceUrl);
        if (parsed.origin === requestUrl.origin) {
          return true;
        }
      } catch {
        // Invalid URL — fall through to rejection
      }
    }

    throw new ForbiddenException('Missing CSRF validation');
  }
}
