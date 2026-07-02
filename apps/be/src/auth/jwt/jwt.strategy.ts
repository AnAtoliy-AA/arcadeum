import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { resolveJwtSecret } from '../../common/utils/jwt-secret.util';

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

function extractJwtFromRequest(req: {
  headers: Record<string, string | string[] | undefined>;
  cookies?: Record<string, string>;
}): string | null {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  const cookie = req.cookies?.access_token;
  if (cookie) {
    return cookie;
  }
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: extractJwtFromRequest,
      secretOrKey: resolveJwtSecret(configService),
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
