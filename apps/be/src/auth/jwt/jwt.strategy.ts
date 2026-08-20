import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { resolveJwtSecret } from '../../common/utils/jwt-secret.util';
import {
  cookieCipherKey,
  decryptTokenCookie,
} from '../../common/utils/token-cookie-cipher.util';

interface JwtPayload {
  sub: string;
  email: string;
  username: string;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  username: string;
}

export function extractJwtFromRequest(
  req: {
    headers: Record<string, string | string[] | undefined>;
    cookies?: Record<string, string>;
  },
  cookieKey: Buffer,
): string | null {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    // The web SSR layer forwards the httpOnly cookie value as a Bearer
    // token, so after ARC-914 that value can be AES-encrypted ciphertext.
    // Accept both plain JWTs and encrypted cookie values; a plain JWT
    // fails the GCM auth tag and falls through to the raw value.
    return decryptTokenCookie(token, cookieKey) ?? token;
  }
  const cookie = req.cookies?.access_token;
  if (cookie) {
    // Pre-encryption cookies are accepted as-is so existing sessions
    // survive the deploy; they are re-encrypted on the next refresh.
    return decryptTokenCookie(cookie, cookieKey) ?? cookie;
  }
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const jwtSecret = resolveJwtSecret(configService);
    const cookieKey = cookieCipherKey(jwtSecret);
    super({
      jwtFromRequest: (req: Request) => extractJwtFromRequest(req, cookieKey),
      secretOrKey: jwtSecret,
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    return {
      userId: payload.sub,
      email: payload.email,
      username: payload.username,
    };
  }
}
