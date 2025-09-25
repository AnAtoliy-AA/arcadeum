import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface OidcDiscoveryDoc {
  token_endpoint?: string;
}

@Injectable()
export class AuthService {
  private discovery: OidcDiscoveryDoc | null = null;
  private fetchedAt = 0;

  constructor(private readonly config: ConfigService) {}

  private async getDiscovery(): Promise<OidcDiscoveryDoc> {
    const issuer = this.config.get<string>('OAUTH_ISSUER');
    if (!issuer) throw new InternalServerErrorException('Missing OAUTH_ISSUER');
    const needsRefresh =
      !this.discovery || Date.now() - this.fetchedAt > 10 * 60 * 1000; // 10 minutes
    if (!needsRefresh) {
      return this.discovery as OidcDiscoveryDoc;
    }
    const url =
      issuer.replace(/\/?$/, '/') + '.well-known/openid-configuration';
    const res = await fetch(url);
    if (!res.ok) {
      throw new InternalServerErrorException('OIDC discovery failed');
    }
    this.discovery = (await res.json()) as OidcDiscoveryDoc;
    this.fetchedAt = Date.now();
    return this.discovery;
  }

  async exchangeCode(params: {
    code: string;
    codeVerifier?: string;
    redirectUri?: string;
  }) {
    const clientId = this.config.get<string>('OAUTH_WEB_CLIENT_ID');
    const clientSecret = this.config.get<string>('OAUTH_WEB_CLIENT_SECRET');
    const redirectEnv = this.config.get<string>('OAUTH_WEB_REDIRECT_URI');
    if (!clientId) {
      throw new InternalServerErrorException('Missing OAUTH_WEB_CLIENT_ID');
    }
    if (!clientSecret) {
      throw new InternalServerErrorException('Missing OAUTH_WEB_CLIENT_SECRET');
    }
    const redirectUri = params.redirectUri || redirectEnv;
    if (!redirectUri) {
      throw new InternalServerErrorException('Missing redirect URI');
    }

    const discovery = await this.getDiscovery();
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
    return {
      accessToken: json.access_token,
      refreshToken: json.refresh_token,
      idToken: json.id_token,
      tokenType: json.token_type,
      scope: json.scope,
      expiresIn: json.expires_in,
    };
  }
}
