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

/**
 * Always-executed verification: folds format validation and constant-time
 * MAC comparison into a single boolean so no request data can decide
 * whether the check itself runs.
 */
function verifyAnonymousSignature(
  id: string,
  signature: string,
  secret: string,
): boolean {
  const expected = crypto.createHmac('sha256', secret).update(id).digest('hex');
  const idOk = ANON_ID_REGEX.test(id) ? 1 : 0;
  const sigOk = ANON_SIGNATURE_REGEX.test(signature) ? 1 : 0;
  let diff = (expected.length ^ signature.length) | (idOk ^ 1) | (sigOk ^ 1);
  const n = Math.min(expected.length, signature.length);
  for (let i = 0; i < n; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
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

    const secret = this.configService.get<string>('ANONYMOUS_ID_SECRET') ?? '';
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    // Verification runs unconditionally — request data never decides
    // whether the check executes. Unsigned identities are tolerated only
    // when no signing secret is configured outside production.
    const signatureValid = verifyAnonymousSignature(anonId, anonSig, secret);
    const fallbackAllowed = secret === '' && !isProduction;

    if (!signatureValid && !fallbackAllowed) {
      return null as TUser;
    }

    const suffix = anonId.slice(
      ANON_ID_PREFIX_LENGTH,
      ANON_ID_PREFIX_LENGTH + 4,
    );
    return {
      userId: anonId,
      email: 'anonymous@example.com',
      username: `Anonymous #${suffix}`,
      displayName: `Anonymous #${suffix}`,
      role: 'user',
    } as unknown as TUser;
  }
}
