import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import type { AuthenticatedUser } from './jwt.strategy';

function verifyAnonymousSignature(
  id: string,
  signature: string,
  secret: string,
): boolean {
  if (!secret || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(id).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(signature, 'hex'),
  );
}

@Injectable()
export class JwtOptionalAuthGuard extends AuthGuard('jwt') {
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

    // Check for anonymous ID header with HMAC signature
    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
    }>();
    const anonId = req.headers['x-anonymous-id'];
    const anonSig = req.headers['x-anonymous-signature'];

    if (anonId && typeof anonId === 'string' && anonId.startsWith('anon_')) {
      const secret = process.env.ANONYMOUS_ID_SECRET ?? '';
      if (secret && anonSig) {
        if (!verifyAnonymousSignature(anonId, anonSig, secret)) {
          return null as TUser;
        }
      } else if (secret && !anonSig) {
        // Secret is configured but signature is missing — reject
        return null as TUser;
      }
      // If no secret is configured, accept without verification (dev mode)

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
