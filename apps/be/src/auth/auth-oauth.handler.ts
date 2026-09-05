import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { OAuthLoginDto } from './dtos/oauth-login.dto';
import {
  GoogleOAuthService,
  AppleOAuthService,
  DiscordOAuthService,
  RefreshTokenService,
} from './services';
import { LoginLockoutService } from './services/login-lockout.service';
import { buildAuthUserProfile, getOrCreateOAuthUser } from './auth-helpers';
import type { AuthTokensResponse } from './lib/types';
import { GeoLookupService } from '../common/geo/geo-lookup.service';

export class AuthOAuthHandler {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwt: JwtService,
    private readonly googleOAuth: GoogleOAuthService,
    private readonly appleOAuth: AppleOAuthService,
    private readonly discordOAuth: DiscordOAuthService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly lockoutService: LoginLockoutService,
    private readonly geoLookup: GeoLookupService,
  ) {}

  async loginWithOAuth(
    data: OAuthLoginDto,
    ip?: string | null,
  ): Promise<AuthTokensResponse> {
    let profile: {
      sub: string;
      email: string;
      emailVerified: boolean;
      name?: string;
    };

    switch (data.provider) {
      case 'google': {
        if (!data.accessToken && !data.idToken) {
          throw new UnauthorizedException('Missing Google OAuth credentials');
        }
        const googleProfile = await this.googleOAuth.fetchGoogleProfile({
          accessToken: data.accessToken,
          idToken: data.idToken,
        });
        if (!googleProfile.emailVerified) {
          throw new UnauthorizedException('Google account email not verified');
        }
        profile = googleProfile;
        break;
      }
      case 'apple': {
        if (!data.idToken) {
          throw new UnauthorizedException('Missing Apple ID token');
        }
        const appleProfile = this.appleOAuth.validateIdToken(data.idToken);
        if (!appleProfile.emailVerified) {
          throw new UnauthorizedException('Apple account email not verified');
        }
        profile = appleProfile;
        break;
      }
      case 'discord': {
        if (!data.authorizationCode) {
          throw new UnauthorizedException('Missing Discord authorization code');
        }
        const { accessToken: discordAccessToken } =
          await this.discordOAuth.exchangeCode({
            code: data.authorizationCode,
          });
        const discordProfile =
          await this.discordOAuth.fetchProfile(discordAccessToken);
        if (!discordProfile.emailVerified) {
          throw new UnauthorizedException('Discord account email not verified');
        }
        profile = discordProfile;
        break;
      }
      default:
        throw new UnauthorizedException('Unsupported OAuth provider');
    }

    const user = await getOrCreateOAuthUser(
      profile,
      this.userModel,
      () => Promise.resolve(),
      () => Promise.resolve(),
    );

    if (user.isBlocked) {
      throw new UnauthorizedException('Account is blocked');
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('Account has been removed');
    }

    if (!user.countryCode) {
      void this.attachCountryFromIp(String(user.id), ip);
    }

    const payload: { sub: string; email: string; username: string } = {
      sub: String(user.id),
      email: user.email,
      username: user.username,
    };

    const accessToken = await this.jwt.signAsync(payload);
    const accessTokenExpiresAt =
      this.refreshTokenService.deriveAccessTokenExpiration(accessToken);
    const refresh = await this.refreshTokenService.issueRefreshToken(
      String(user.id),
      null,
    );

    return {
      accessToken,
      accessTokenExpiresAt,
      refreshToken: refresh.token,
      refreshTokenExpiresAt: refresh.expiresAt,
      user: buildAuthUserProfile(user),
    };
  }

  private async attachCountryFromIp(
    userId: string,
    ip: string | null | undefined,
  ): Promise<void> {
    if (!ip) return;
    try {
      const countryCode = await this.geoLookup.getCountry(ip);
      if (!countryCode) return;
      await this.userModel.updateOne(
        { _id: userId },
        { $set: { countryCode } },
      );
    } catch {
      // Non-critical
    }
  }
}
