import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refresh-token.schema';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { OAuthLoginDto } from './dtos/oauth-login.dto';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface OidcDiscoveryDoc {
  token_endpoint?: string;
}

export interface OAuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  tokenType?: string;
  scope?: string;
  expiresIn?: number;
}

export interface AuthUserProfile {
  id: string;
  email: string;
  username: string;
  createdAt?: Date;
}

interface GoogleUserProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  audience?: string;
}

@Injectable()
export class AuthService {
  private discovery: OidcDiscoveryDoc | null = null;
  private fetchedAt = 0;

  constructor(
    private readonly config: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private readonly refreshModel: Model<RefreshTokenDocument>,
    private readonly jwt: JwtService,
  ) {}

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
  }): Promise<OAuthTokenResponse> {
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

  // Local auth (email/password)
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
    // Access timestamps defensively (schema has timestamps: true)
    const createdAt = (created as Partial<{ createdAt: Date }>).createdAt;
    return {
      id: String(created.id),
      email: created.email,
      username: created.username,
      createdAt,
    };
  }

  async login(data: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
    user: AuthUserProfile;
  }> {
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
    // Also issue refresh token
    const refresh = await this.issueRefreshToken(String(user.id), null);
    return {
      accessToken,
      refreshToken: refresh.token,
      refreshTokenExpiresAt: refresh.expiresAt,
      user: { id: String(user.id), email: user.email, username: user.username },
    }; // token is raw value
  }

  async loginWithOAuth(data: OAuthLoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
    user: AuthUserProfile;
  }> {
    if (data.provider !== 'google') {
      throw new UnauthorizedException('Unsupported OAuth provider');
    }

    if (!data.accessToken && !data.idToken) {
      throw new UnauthorizedException('Missing OAuth credentials');
    }

    const profile = await this.fetchGoogleProfile({
      accessToken: data.accessToken,
      idToken: data.idToken,
    });

    if (!profile.emailVerified) {
      throw new UnauthorizedException('Google account email not verified');
    }

    const user = await this.getOrCreateOAuthUser(profile);

    const payload: { sub: string; email: string; username: string } = {
      sub: String(user.id),
      email: user.email,
      username: user.username,
    };

    const accessToken = await this.jwt.signAsync(payload);
    const refresh = await this.issueRefreshToken(String(user.id), null);

    return {
      accessToken,
      refreshToken: refresh.token,
      refreshTokenExpiresAt: refresh.expiresAt,
      user: { id: String(user.id), email: user.email, username: user.username },
    };
  }

  // Refresh token issuance (rotation)
  private async issueRefreshToken(
    userId: string,
    parentId: string | null,
  ): Promise<{ token: string; expiresAt: Date; id: string }> {
    const raw = crypto.randomUUID() + '.' + crypto.randomUUID();
    const hash = await bcrypt.hash(raw, 10);
    const ttlDays = Number(
      this.config.get<string>('REFRESH_TOKEN_TTL_DAYS') || '7',
    );
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
    const rotationParentId = parentId || 'root';
    const doc = await this.refreshModel.create({
      userId,
      tokenHash: hash,
      expiresAt,
      rotationParentId,
    });
    return { token: raw, expiresAt, id: String(doc.id) };
  }

  async refreshToken(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _rawToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Basic skeleton: verify, rotate, return new tokens
    const stored = await this.refreshModel.findOne({ revoked: false });
    // NOTE: For brevity, we are not querying by token hash yet (needs hash comparison)
    if (!stored) throw new UnauthorizedException('Invalid token');
    // Placeholder: in real flow we would find by hash match using bcrypt.compare
    const userId = String(stored.userId);
    const userDoc = await this.userModel.findById(userId);
    if (!userDoc) {
      throw new UnauthorizedException('User not found for refresh token');
    }
    const user = await this.ensureUserUsername(userDoc);
    const newAccess = await this.jwt.signAsync({
      sub: userId,
      email: user.email,
      username: user.username,
    });
    const rotated = await this.issueRefreshToken(userId, String(stored.id));
    // Mark old as revoked
    stored.revoked = true;
    await stored.save();
    return { accessToken: newAccess, refreshToken: rotated.token };
  }

  async searchUsers(params: {
    query: string;
    requestingUserId: string;
    limit?: number;
  }): Promise<Array<{ id: string; email: string; username: string }>> {
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
    }));
  }

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
      return this.ensureUserUsername(existing);
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
    });

    return created;
  }

  private getAllowedOAuthClientIds(): string[] {
    const clientIds = [
      this.config.get<string>('OAUTH_WEB_CLIENT_ID'),
      this.config.get<string>('OAUTH_ANDROID_CLIENT_ID'),
      this.config.get<string>('OAUTH_IOS_CLIENT_ID'),
    ];

    return clientIds.filter((value): value is string => Boolean(value));
  }

  private async fetchGoogleProfile(params: {
    accessToken?: string;
    idToken?: string;
  }): Promise<GoogleUserProfile> {
    const allowedAudiences = this.getAllowedOAuthClientIds();

    const attemptFromAccessToken = async () => {
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

    const attemptFromIdToken = async () => {
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
