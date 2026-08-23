import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import type { AuthenticatedUser } from './jwt.strategy';

const ANON_ID_PREFIX_LENGTH = 5;
const ANON_ID_REGEX = /^anon_[0-9a-f-]{4,64}$/;
const ANON_SIGNATURE_REGEX = /^[0-9a-f]{64}$/;

function normalizeHeader(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function verifyAnonymousSignature(
  id: string,
  signature: string,
  secret: string,
): boolean {
  const expected = crypto.createHmac('sha256', secret).update(id).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'utf8'),
    Buffer.from(signature, 'utf8'),
  );
}

@Injectable()
export class JwtOptionalAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      await super.canActivate(context);
      return true;
    } catch {
      // Swallow authentication errors so unauthenticated requests can proceed.
      return true;
    }
  }

  override handleRequest<TUser = AuthenticatedUser | null>(
    err: unknown,
    user: AuthenticatedUser | false | null | undefined,
    info: unknown,
    context: ExecutionContext,
    status?: unknown,
  ): TUser {
    void info;
    void status;

    if (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error(
        typeof err === 'string'
          ? err
          : 'Authentication failed for this request.',
      );
    }
    if (user) {
      return user as TUser;
    }

    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
    }>();
    const anonId = normalizeHeader(req.headers['x-anonymous-id']);
    const anonSig = normalizeHeader(req.headers['x-anonymous-signature']);

    // Reject-only gates below: every branch either proceeds towards issuing
    // an anonymous identity or returns an unauthenticated user. Verification
    // itself is never skippable based on request data.
    if (!ANON_ID_REGEX.test(anonId)) {
      return null as TUser;
    }
    if (anonSig !== '' && !ANON_SIGNATURE_REGEX.test(anonSig)) {
      return null as TUser;
    }

    const secret = this.configService.get<string>('ANONYMOUS_ID_SECRET') ?? '';
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    // Unsigned identities are only tolerated when no signing secret is
    // configured outside production; production fails closed instead.
    const fallbackAllowed = secret === '' && !isProduction;
    if (anonSig !== '') {
      if (!verifyAnonymousSignature(anonId, anonSig, secret)) {
        return null as TUser;
      }
    } else if (!fallbackAllowed) {
      return null as TUser;
    }

    const suffix = anonId.slice(ANON_ID_PREFIX_LENGTH, 9);
    return {
      userId: anonId,
      email: 'anonymous@example.com',
      username: `Anonymous #${suffix}`,
      displayName: `Anonymous #${suffix}`,
      role: 'user',
    } as unknown as TUser;
  }
}
