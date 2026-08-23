import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import type { AuthenticatedUser } from './jwt.strategy';

const SIGNATURE_HEX_LENGTH = 64;

function verifyAnonymousSignature(
  id: string,
  signature: string,
  secret: string,
): boolean {
  if (!secret || !signature) return false;
  if (signature.length !== SIGNATURE_HEX_LENGTH) return false;
  if (!/^[0-9a-fA-F]{64}$/.test(signature)) return false;
  const expected = crypto.createHmac('sha256', secret).update(id).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'utf8'),
    Buffer.from(signature.toLowerCase(), 'utf8'),
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
    void context;
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
    const anonId = req.headers['x-anonymous-id'];
    const anonSig = req.headers['x-anonymous-signature'];

    if (
      anonId &&
      typeof anonId === 'string' &&
      typeof anonSig === 'string' &&
      anonId.startsWith('anon_')
    ) {
      const secret =
        this.configService.get<string>('ANONYMOUS_ID_SECRET') ?? '';
      const isProduction =
        this.configService.get<string>('NODE_ENV') === 'production';

      const signatureValid = verifyAnonymousSignature(anonId, anonSig, secret);
      // Fail closed in production: an unsigned anonymous identity is only
      // tolerated when no signing secret is configured outside production.
      if (!signatureValid && (secret !== '' || isProduction)) {
        return null as TUser;
      }

      const suffix = anonId.replace('anon_', '').slice(0, 4);
      return {
        userId: anonId,
        email: 'anonymous@example.com',
        username: `Anonymous #${suffix}`,
        displayName: `Anonymous #${suffix}`,
        role: 'user',
      } as unknown as TUser;
    }

    return null as TUser;
  }
}
