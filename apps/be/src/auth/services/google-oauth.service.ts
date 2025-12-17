/**
 * Google OAuth provider service.
 * Handles Google-specific OAuth logic including code exchange and profile fetching.
 */
import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { OAuthClientService } from './oauth-client.service';
import type { GoogleUserProfile, OAuthTokenResponse } from '../lib/types';
import { sanitize } from '../lib/utils';

@Injectable()
export class GoogleOAuthService {
  constructor(private readonly oauthClient: OAuthClientService) {}

  /**
   * Exchange an authorization code for OAuth tokens.
   */
  async exchangeCode(params: {
    code: string;
    codeVerifier?: string;
    redirectUri?: string;
    requestOrigin?: string;
  }): Promise<OAuthTokenResponse> {
    const webClients = this.oauthClient.getWebClientConfigs();
    if (webClients.length === 0) {
      throw new InternalServerErrorException(
        'Missing OAuth web client configuration',
      );
    }

    let redirectUri = sanitize(params.redirectUri);
    let client = redirectUri
      ? this.oauthClient.findClientForRedirect(webClients, redirectUri)
      : undefined;

    if (redirectUri && !client) {
      throw new InternalServerErrorException('Redirect URI not allowed');
    }

    if (!redirectUri) {
      const originMatch = params.requestOrigin
        ? this.oauthClient.findClientByOrigin(webClients, params.requestOrigin)
        : undefined;
      if (originMatch) {
        client = originMatch.client;
        redirectUri =
          originMatch.redirectUri ?? originMatch.client.redirectUris[0];
      } else {
        client = this.oauthClient.findDefaultWebClient(webClients);
        redirectUri = client?.redirectUris[0];
      }
    }

    if (!client) {
      throw new InternalServerErrorException(
        'Missing OAuth web client configuration',
      );
    }

    if (!redirectUri) {
      throw new InternalServerErrorException('Missing redirect URI');
    }

    const { id: clientId, secret: clientSecret } = client;

    const discovery = await this.oauthClient.getDiscovery();
    const tokenEndpoint = discovery.token_endpoint;
    if (!tokenEndpoint) {
      throw new InternalServerErrorException('No token endpoint');
    }

    const body = new URLSearchParams();
    body.set('grant_type', 'authorization_code');
    body.set('code', params.code);
    body.set('client_id', clientId);
    body.set('client_secret', clientSecret);
    body.set('redirect_uri', redirectUri);
    if (params.codeVerifier) body.set('code_verifier', params.codeVerifier);

    const res = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    type TokenJSON = {
      access_token?: string;
      refresh_token?: string;
      id_token?: string;
      token_type?: string;
      scope?: string;
      expires_in?: number;
      error?: string;
    };

    let json: TokenJSON | null = null;
    try {
      json = (await res.json()) as TokenJSON;
    } catch {
      throw new InternalServerErrorException('Failed to parse token response');
    }

    if (!res.ok || !json) {
      throw new InternalServerErrorException(
        `Token exchange failed: ${(json && json.error) || res.status}`,
      );
    }

    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      id_token: idToken,
      token_type: tokenType,
      scope,
      expires_in: expiresIn,
    } = json;

    if (!accessToken) {
      throw new InternalServerErrorException(
        'Token exchange missing access_token',
      );
    }

    return { accessToken, refreshToken, idToken, tokenType, scope, expiresIn };
  }

  /**
   * Fetch a Google user profile from access token or ID token.
   */
  async fetchGoogleProfile(params: {
    accessToken?: string;
    idToken?: string;
  }): Promise<GoogleUserProfile> {
    const allowedAudiences = this.oauthClient.getAllowedOAuthClientIds();

    const attemptFromAccessToken = async (): Promise<GoogleUserProfile | null> => {
      if (!params.accessToken) return null;
      const res = await fetch(
        'https://openidconnect.googleapis.com/v1/userinfo',
        {
          headers: { Authorization: `Bearer ${params.accessToken}` },
        },
      );
      if (!res.ok) {
        return null;
      }
      const json = (await res.json()) as Record<string, unknown>;
      const email =
        typeof json.email === 'string' ? json.email.toLowerCase() : '';
      const sub = typeof json.sub === 'string' ? json.sub : '';
      const name = typeof json.name === 'string' ? json.name : undefined;
      const emailVerifiedRaw = json.email_verified;
      const emailVerified =
        emailVerifiedRaw === true ||
        emailVerifiedRaw === 'true' ||
        emailVerifiedRaw === 1 ||
        emailVerifiedRaw === '1';
      const aud = typeof json.aud === 'string' ? json.aud : undefined;

      if (!email || !sub) {
        return null;
      }

      if (allowedAudiences.length && aud && !allowedAudiences.includes(aud)) {
        throw new UnauthorizedException('OAuth client mismatch');
      }

      return {
        sub,
        email,
        emailVerified,
        name,
        audience: aud,
      } satisfies GoogleUserProfile;
    };

    const attemptFromIdToken = async (): Promise<GoogleUserProfile | null> => {
      if (!params.idToken) return null;
      const res = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(params.idToken)}`,
      );
      if (!res.ok) {
        return null;
      }
      const json = (await res.json()) as Record<string, unknown>;
      const email =
        typeof json.email === 'string' ? json.email.toLowerCase() : '';
      const sub = typeof json.sub === 'string' ? json.sub : '';
      const name = typeof json.name === 'string' ? json.name : undefined;
      const emailVerifiedRaw = json.email_verified;
      const emailVerified =
        emailVerifiedRaw === true ||
        emailVerifiedRaw === 'true' ||
        emailVerifiedRaw === 1 ||
        emailVerifiedRaw === '1';
      const aud = typeof json.aud === 'string' ? json.aud : undefined;

      if (!email || !sub) {
        return null;
      }

      if (allowedAudiences.length && aud && !allowedAudiences.includes(aud)) {
        throw new UnauthorizedException('OAuth client mismatch');
      }

      return {
        sub,
        email,
        emailVerified,
        name,
        audience: aud,
      } satisfies GoogleUserProfile;
    };

    const fromAccessToken = await attemptFromAccessToken();
    if (fromAccessToken) {
      return fromAccessToken;
    }

    const fromIdToken = await attemptFromIdToken();
    if (fromIdToken) {
      return fromIdToken;
    }

    throw new UnauthorizedException('Unable to validate OAuth tokens');
  }
}
