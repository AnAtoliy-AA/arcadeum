/**
 * Discord OAuth provider service.
 * Handles Discord-specific OAuth logic including token exchange and profile fetching.
 */
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { DiscordUserProfile } from '../lib/types';

@Injectable()
export class DiscordOAuthService {
  private readonly logger = new Logger(DiscordOAuthService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(private readonly config: ConfigService) {
    this.clientId = this.config.get<string>('DISCORD_CLIENT_ID') ?? '';
    this.clientSecret = this.config.get<string>('DISCORD_CLIENT_SECRET') ?? '';

    if (!this.clientId || !this.clientSecret) {
      this.logger.warn('Discord OAuth credentials not configured');
    }
  }

  /**
   * Exchange an authorization code for Discord access token.
   */
  async exchangeCode(params: {
    code: string;
    redirectUri?: string;
  }): Promise<{ accessToken: string }> {
    if (!this.clientId || !this.clientSecret) {
      throw new InternalServerErrorException('Discord OAuth not configured');
    }

    const body = new URLSearchParams();
    body.set('client_id', this.clientId);
    body.set('client_secret', this.clientSecret);
    body.set('grant_type', 'authorization_code');
    body.set('code', params.code);
    if (params.redirectUri) {
      body.set('redirect_uri', params.redirectUri);
    }

    const res = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    type TokenJSON = {
      access_token?: string;
      token_type?: string;
      expires_in?: number;
      refresh_token?: string;
      scope?: string;
      error?: string;
      error_description?: string;
    };

    let json: TokenJSON | null = null;
    try {
      json = (await res.json()) as TokenJSON;
    } catch {
      throw new InternalServerErrorException(
        'Failed to parse Discord token response',
      );
    }

    if (!res.ok || !json) {
      throw new InternalServerErrorException(
        `Discord token exchange failed: ${(json && (json.error_description || json.error)) || res.status}`,
      );
    }

    if (!json.access_token) {
      throw new InternalServerErrorException(
        'Discord token exchange missing access_token',
      );
    }

    return { accessToken: json.access_token };
  }

  /**
   * Fetch Discord user profile from access token.
   */
  async fetchProfile(accessToken: string): Promise<DiscordUserProfile> {
    const res = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new UnauthorizedException('Failed to fetch Discord profile');
    }

    const json = (await res.json()) as Record<string, unknown>;

    const id = typeof json.id === 'string' ? json.id : '';
    const email =
      typeof json.email === 'string' ? json.email.toLowerCase() : '';
    const username =
      typeof json.username === 'string' ? json.username : undefined;
    const avatar = typeof json.avatar === 'string' ? json.avatar : undefined;
    const discriminator =
      typeof json.discriminator === 'string' ? json.discriminator : undefined;
    const verified = json.verified === true;

    if (!id || !email) {
      throw new UnauthorizedException('Invalid Discord profile data');
    }

    return {
      sub: id,
      email,
      emailVerified: verified,
      username,
      avatar,
      discriminator,
    };
  }
}
