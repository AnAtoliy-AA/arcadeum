/**
 * Auth service.
 * Composes sub-services for OAuth, refresh tokens, and user management.
 */
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { OAuthLoginDto } from './dtos/oauth-login.dto';
import {
  OAuthClientService,
  RefreshTokenService,
  GoogleOAuthService,
} from './services';
import { escapeRegex } from './lib/utils';
import type {
  AuthUserProfile,
  AuthTokensResponse,
  OAuthTokenResponse,
  GoogleUserProfile,
} from './lib/types';

// Re-export types for backwards compatibility
export type { OAuthTokenResponse, AuthUserProfile } from './lib/types';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwt: JwtService,
    private readonly oauthClient: OAuthClientService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly googleOAuth: GoogleOAuthService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // OAuth Code Exchange (delegated to GoogleOAuthService)
  // ─────────────────────────────────────────────────────────────────────────────

  async exchangeCode(params: {
    code: string;
    codeVerifier?: string;
    redirectUri?: string;
    requestOrigin?: string;
  }): Promise<OAuthTokenResponse> {
    return this.googleOAuth.exchangeCode(params);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Local Auth (email/password)
  // ─────────────────────────────────────────────────────────────────────────────

  async register(data: RegisterDto): Promise<AuthUserProfile> {
    const email = data.email.toLowerCase();
    const username = data.username.trim();
    const usernameNormalized = username.toLowerCase();

    const [existingEmail, existingUsername] = await Promise.all([
      this.userModel.exists({ email }),
      this.userModel.exists({ usernameNormalized }),
    ]);

    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const created = await this.userModel.create({
      email,
      passwordHash,
      username,
      usernameNormalized,
    });
    return this.buildAuthUserProfile(created);
  }

  async login(data: LoginDto): Promise<AuthTokensResponse> {
    const email = data.email.toLowerCase();
    const userDoc = await this.userModel.findOne({ email });
    if (!userDoc) throw new UnauthorizedException('Invalid credentials');

    const user = await this.ensureUserUsername(userDoc);

    const passwordOk = await bcrypt.compare(data.password, user.passwordHash);
    if (!passwordOk) throw new UnauthorizedException('Invalid credentials');

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
    const authUser = this.buildAuthUserProfile(user);
    return {
      accessToken,
      accessTokenExpiresAt,
      refreshToken: refresh.token,
      refreshTokenExpiresAt: refresh.expiresAt,
      user: authUser,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // OAuth Login
  // ─────────────────────────────────────────────────────────────────────────────

  async loginWithOAuth(data: OAuthLoginDto): Promise<AuthTokensResponse> {
    if (data.provider !== 'google') {
      throw new UnauthorizedException('Unsupported OAuth provider');
    }

    if (!data.accessToken && !data.idToken) {
      throw new UnauthorizedException('Missing OAuth credentials');
    }

    const googleProfile = await this.googleOAuth.fetchGoogleProfile({
      accessToken: data.accessToken,
      idToken: data.idToken,
    });

    if (!googleProfile.emailVerified) {
      throw new UnauthorizedException('Google account email not verified');
    }

    const user = await this.getOrCreateOAuthUser(googleProfile);

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
    const userProfile = this.buildAuthUserProfile(user);

    return {
      accessToken,
      accessTokenExpiresAt,
      refreshToken: refresh.token,
      refreshTokenExpiresAt: refresh.expiresAt,
      user: userProfile,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Refresh Token (delegated to RefreshTokenService)
  // ─────────────────────────────────────────────────────────────────────────────

  async refreshToken(rawToken: string): Promise<AuthTokensResponse> {
    return this.refreshTokenService.refreshToken(
      rawToken,
      (user) => this.buildAuthUserProfile(user),
      (user) => this.ensureUserUsername(user),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // User Search & Profile
  // ─────────────────────────────────────────────────────────────────────────────

  async searchUsers(params: {
    query: string;
    requestingUserId: string;
    limit?: number;
  }): Promise<
    Array<{ id: string; email: string; username: string; displayName: string }>
  > {
    const trimmed = params.query?.trim();
    if (!trimmed) {
      return [];
    }

    const limit = Math.min(Math.max(params.limit ?? 10, 1), 25);
    const pattern = new RegExp(escapeRegex(trimmed), 'i');

    const users = await this.userModel
      .find({
        _id: { $ne: params.requestingUserId },
        $or: [
          { username: pattern },
          { usernameNormalized: pattern },
          { email: pattern },
        ],
      })
      .sort({ usernameNormalized: 1 })
      .limit(limit)
      .exec();

    return users.map((user) => ({
      id: String(user.id),
      email: user.email,
      username: user.username,
      displayName: this.resolveDisplayName(user),
    }));
  }

  async getUserProfileById(userId: string): Promise<AuthUserProfile> {
    const doc = await this.userModel.findById(userId);
    if (!doc) {
      throw new UnauthorizedException('User not found');
    }
    const ensured = await this.ensureUserUsername(doc);
    return this.buildAuthUserProfile(ensured);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  private sanitizeUsernameCandidate(source: string): string {
    const base = source.replace(/[^a-zA-Z0-9_-]/g, '');
    if (base.length >= 3) return base;
    return `user${Math.floor(Math.random() * 9000 + 1000)}`;
  }

  private async ensureUserUsername(user: UserDocument): Promise<UserDocument> {
    if (user.username && user.usernameNormalized) {
      return user;
    }

    const emailLocal = user.email.split('@')[0] ?? 'user';
    const base = this.sanitizeUsernameCandidate(emailLocal);
    let candidate = base;
    let normalized = candidate.toLowerCase();
    let suffix = 1;

    while (
      await this.userModel.exists({
        usernameNormalized: normalized,
        _id: { $ne: user._id },
      })
    ) {
      candidate = `${base}${suffix}`;
      normalized = candidate.toLowerCase();
      suffix += 1;
    }

    user.username = candidate;
    user.usernameNormalized = normalized;
    await user.save();
    return user;
  }

  private async getOrCreateOAuthUser(
    profile: GoogleUserProfile,
  ): Promise<UserDocument> {
    const email = profile.email.toLowerCase();
    const existing = await this.userModel.findOne({ email });
    if (existing) {
      const ensured = await this.ensureUserUsername(existing);
      const preferredDisplay = profile.name?.trim();
      if (preferredDisplay && ensured.displayName !== preferredDisplay) {
        ensured.displayName = preferredDisplay;
        await ensured.save();
      }
      return ensured;
    }

    const preferredName = profile.name?.trim() || email.split('@')[0] || 'user';
    const base = this.sanitizeUsernameCandidate(preferredName);
    let candidate = base;
    let normalized = candidate.toLowerCase();
    let suffix = 1;

    while (await this.userModel.exists({ usernameNormalized: normalized })) {
      candidate = `${base}${suffix}`;
      normalized = candidate.toLowerCase();
      suffix += 1;
    }

    const placeholderPassword = await bcrypt.hash(crypto.randomUUID(), 12);

    const created = await this.userModel.create({
      email,
      passwordHash: placeholderPassword,
      username: candidate,
      usernameNormalized: normalized,
      displayName: profile.name?.trim() || undefined,
    });

    return created;
  }

  private resolveDisplayName(
    user: Pick<User, 'displayName' | 'username' | 'email'>,
  ): string {
    const preferred = user.displayName?.trim?.();
    if (preferred) {
      return preferred;
    }

    const username = user.username?.trim?.();
    if (username) {
      return username;
    }

    const [localPart] = user.email?.split?.('@') ?? [];
    const local = localPart?.trim?.();
    if (local) {
      return local;
    }

    return user.email;
  }

  private buildAuthUserProfile(user: UserDocument): AuthUserProfile {
    const profile: AuthUserProfile = {
      id: String(user.id),
      email: user.email,
      username: user.username,
      displayName: this.resolveDisplayName(user),
    };

    const createdAt = (user as Partial<{ createdAt: Date }>).createdAt;
    if (createdAt instanceof Date) {
      profile.createdAt = createdAt;
    }

    return profile;
  }
}
