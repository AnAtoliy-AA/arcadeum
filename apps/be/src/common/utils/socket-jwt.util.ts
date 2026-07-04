import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import type { Socket } from 'socket.io';
import { resolveJwtSecret } from './jwt-secret.util';
import type { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string;
  [key: string]: unknown;
}

/**
 * Verify a JWT from socket handshake auth.
 * Returns the userId if valid, null if no token or invalid token.
 * Does NOT disconnect — callers decide what to do with null.
 */
export async function verifySocketJwt(
  client: Socket,
  jwt: JwtService,
  config: ConfigService,
  logger: Logger,
  gatewayName: string,
): Promise<string | null> {
  const token: unknown = client.handshake?.auth?.token;

  if (typeof token !== 'string' || token.trim().length === 0) {
    return null;
  }

  try {
    const payload = await jwt.verifyAsync<JwtPayload>(token, {
      secret: resolveJwtSecret(config),
    });

    const userId = payload.sub;
    if (userId && typeof userId === 'string') {
      (client.data as Record<string, unknown>)['userId'] = userId;
      (client.data as Record<string, unknown>)['authenticated'] = true;
      logger.debug(
        `${gatewayName}: socket ${client.id} authenticated as ${userId}`,
      );
      return userId;
    }

    return null;
  } catch {
    logger.warn(`${gatewayName}: invalid token for socket ${client.id}`);
    return null;
  }
}
