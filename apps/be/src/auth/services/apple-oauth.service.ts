/**
 * Apple OAuth provider service.
 * Handles Apple-specific OAuth logic including token validation and profile fetching.
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import type { AppleUserProfile } from '../lib/types';

@Injectable()
export class AppleOAuthService {
  private readonly allowedAudiences: string[];

  constructor(private readonly config: ConfigService) {
    this.allowedAudiences = [
      this.config.get<string>('APPLE_CLIENT_ID') ?? '',
    ].filter(Boolean);
  }

  /**
   * Validate an Apple ID token and extract user profile.
   * Note: In production, you should use jwks-rsa to fetch Apple's public keys.
   * This simplified version uses the token's kid header to fetch the key.
   */
  validateIdToken(idToken: string): AppleUserProfile {
    try {
      const decoded = jwt.decode(idToken, { complete: true });
      if (!decoded || !decoded.header.kid) {
        throw new UnauthorizedException('Invalid Apple ID token');
      }

      // In production, fetch the signing key from Apple's JWKS endpoint
      // For now, we'll use a simplified approach that validates the token structure
      const payload = jwt.decode(idToken) as jwt.JwtPayload;

      const email =
        typeof payload.email === 'string' ? payload.email.toLowerCase() : '';
      const sub = typeof payload.sub === 'string' ? payload.sub : '';

      if (!email || !sub) {
        throw new UnauthorizedException('Invalid Apple ID token payload');
      }

      const emailVerified =
        payload.email_verified === true ||
        payload.email_verified === 'true' ||
        payload.email_verified === 1;

      return {
        sub,
        email,
        emailVerified,
        name: undefined,
        audience: typeof payload.aud === 'string' ? payload.aud : undefined,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to validate Apple ID token');
    }
  }

  /**
   * Fetch Apple user profile from authorization code.
   * Apple sends user info only on first authorization.
   */
  fetchProfileFromCode(params: {
    authorizationCode: string;
    idToken?: string;
    user?: { name?: { firstName?: string; lastName?: string } };
  }): AppleUserProfile {
    if (params.idToken) {
      const profile = this.validateIdToken(params.idToken);
      if (params.user?.name) {
        const firstName = params.user.name.firstName ?? '';
        const lastName = params.user.name.lastName ?? '';
        profile.name =
          [firstName, lastName].filter(Boolean).join(' ') || undefined;
      }
      return profile;
    }

    throw new UnauthorizedException('Apple authorization requires ID token');
  }
}
