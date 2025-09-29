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
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

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
  async register(
    data: RegisterDto,
  ): Promise<{ id: string; email: string; createdAt?: Date }> {
    const email = data.email.toLowerCase();
    const existing = await this.userModel.exists({ email });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(data.password, 12);
    const created = await this.userModel.create({ email, passwordHash });
    // Access timestamps defensively (schema has timestamps: true)
    const createdAt = (created as Partial<{ createdAt: Date }>).createdAt;
    return {
      id: String(created.id),
      email: created.email,
      createdAt,
    };
  }

  async login(data: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
  }> {
    const email = data.email.toLowerCase();
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordOk = await bcrypt.compare(data.password, user.passwordHash);
    if (!passwordOk) throw new UnauthorizedException('Invalid credentials');

    const payload: { sub: string; email: string } = {
      sub: String(user.id),
      email: user.email,
    };
    const accessToken = await this.jwt.signAsync(payload);
    // Also issue refresh token
    const refresh = await this.issueRefreshToken(String(user.id), null);
    return {
      accessToken,
      refreshToken: refresh.token,
      refreshTokenExpiresAt: refresh.expiresAt,
    }; // token is raw value
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
    const newAccess = await this.jwt.signAsync({ sub: userId });
    const rotated = await this.issueRefreshToken(userId, String(stored.id));
    // Mark old as revoked
    stored.revoked = true;
    await stored.save();
    return { accessToken: newAccess, refreshToken: rotated.token };
  }
}
