import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from './jwt.strategy';

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

    // Check for anonymous ID header
    const req = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | undefined> }>();
    const anonId = req.headers['x-anonymous-id'];

    if (anonId && typeof anonId === 'string' && anonId.startsWith('anon_')) {
      return {
        userId: anonId,
        email: 'anonymous@example.com',
        username: 'Anonymous',
        displayName: 'Anonymous',
        role: 'user', // Basic role
      } as unknown as TUser;
    }

    return null as TUser;
  }
}
