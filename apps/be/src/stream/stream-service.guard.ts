import { createHash, timingSafeEqual } from 'crypto';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

const MIN_TOKEN_LENGTH = 24;
const DEFAULT_STREAM_USERNAME = 'arcadeum_live';

const digest = (v: string): Buffer => createHash('sha256').update(v).digest();

/**
 * Service authentication for the stream director. Never public:
 *  1. `Authorization: Bearer <STREAM_SERVICE_TOKEN>` (constant-time compare), or
 *  2. a valid JWT that belongs to the dedicated stream user
 *     (`STREAM_BOT_USERNAME`, default `arcadeum_live`).
 * Everything else is 401/403. Admin JWTs are NOT accepted here on purpose.
 */
@Injectable()
export class StreamServiceGuard implements CanActivate {
  private readonly logger = new Logger(StreamServiceGuard.name);
  private readonly serviceToken: Buffer | null;
  private readonly streamUsername: string;

  constructor(
    config: ConfigService,
    private readonly jwtGuard: JwtAuthGuard,
  ) {
    const token = (config.get<string>('STREAM_SERVICE_TOKEN') ?? '').trim();
    if (token && token.length < MIN_TOKEN_LENGTH) {
      this.logger.warn(
        `STREAM_SERVICE_TOKEN is shorter than ${MIN_TOKEN_LENGTH} characters and is ignored`,
      );
    }
    this.serviceToken = token.length >= MIN_TOKEN_LENGTH ? digest(token) : null;
    this.streamUsername =
      (config.get<string>('STREAM_BOT_USERNAME') ?? '').trim() ||
      DEFAULT_STREAM_USERNAME;
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      user?: AuthenticatedUser;
    }>();
    const header = req.headers.authorization;
    const bearer =
      typeof header === 'string' && header.startsWith('Bearer ')
        ? header.slice(7).trim()
        : '';
    if (!bearer) throw new UnauthorizedException();

    if (
      this.serviceToken &&
      timingSafeEqual(digest(bearer), this.serviceToken)
    ) {
      return true;
    }

    // Not the service token: it must be the stream user's JWT.
    try {
      await this.jwtGuard.canActivate(ctx);
    } catch {
      throw new UnauthorizedException();
    }
    if (req.user?.username !== this.streamUsername) {
      throw new ForbiddenException();
    }
    return true;
  }
}
