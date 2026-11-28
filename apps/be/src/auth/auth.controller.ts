import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
  Query,
  Headers,
  HttpCode,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import {
  AuthService,
  AuthTokensResponse,
  OAuthTokenResponse,
} from './auth.service';
import { TokenExchangeDto } from './dtos/token-exchange.dto';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from './jwt/jwt.guard';
import { AuthenticatedUser } from './jwt/jwt.strategy';
import { OAuthLoginDto } from './dtos/oauth-login.dto';
import { RefreshTokenRequestDto } from './dtos/refresh-token-request.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { RequestMagicLinkDto, VerifyMagicLinkDto } from './dtos/magic-link.dto';
import { PasswordResetService } from './services/password-reset.service';
import { MagicLinkService } from './services/magic-link.service';
import { ConfigService } from '@nestjs/config';
import { resolveJwtSecret } from '../common/utils/jwt-secret.util';
import {
  cookieCipherKey,
  decryptTokenCookie,
  encryptTokenCookie,
} from '../common/utils/token-cookie-cipher.util';

import { resolveCookieDomain, resolveCookieNames } from './lib/cookie-domain';

const COOKIE_MAX_AGE_15_MIN = 15 * 60 * 1000;
const COOKIE_MAX_AGE_30_DAYS = 30 * 24 * 60 * 60 * 1000;

function setTokenCookies(
  res: Response,
  req: Request,
  cookieKey: Buffer,
  cookieDomain: string | undefined,
  accessToken: string,
  accessTokenExpiresAt: Date | null,
  refreshToken: string,
  refreshTokenExpiresAt: Date,
): void {
  const domain = resolveCookieDomain(req, cookieDomain);
  const names = resolveCookieNames(req);
  clearLegacyHostOnlyCookies(res, req, domain);
  const maxAgeAccess = accessTokenExpiresAt
    ? Math.min(
        accessTokenExpiresAt.getTime() - Date.now(),
        COOKIE_MAX_AGE_15_MIN,
      )
    : COOKIE_MAX_AGE_15_MIN;
  const maxAgeRefresh =
    refreshTokenExpiresAt.getTime() - Date.now() || COOKIE_MAX_AGE_30_DAYS;

  // Both cookies carry bearer credentials, so they must always be
  // TLS-only — a conditional `secure` would leave the token transmittable
  // in clear text over plain HTTP. Browsers treat http://localhost as a
  // secure context, so local dev keeps working.
  //
  // The values are AES-GCM encrypted before storage so the credentials
  // are never persisted in clear text (CWE-312).
  res.cookie(names.access, encryptTokenCookie(accessToken, cookieKey), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    ...(domain ? { domain } : {}),
    path: '/',
    maxAge: Math.max(maxAgeAccess, 0),
  });
  res.cookie(names.refresh, encryptTokenCookie(refreshToken, cookieKey), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    ...(domain ? { domain } : {}),
    path: '/',
    maxAge: Math.max(maxAgeRefresh, 0),
  });
}

function clearTokenCookies(
  res: Response,
  req: Request,
  configuredDomain: string | undefined,
): void {
  const domain = resolveCookieDomain(req, configuredDomain);
  const options = {
    path: '/',
    httpOnly: true,
    // Must match the attributes the cookies were set with, otherwise
    // browsers won't match them for deletion.
    secure: true,
    sameSite: 'lax' as const,
    ...(domain ? { domain } : {}),
  };
  const names = resolveCookieNames(req);
  res.clearCookie(names.access, options);
  res.clearCookie(names.refresh, options);
  clearLegacyHostOnlyCookies(res, req, domain);
}

/**
 * Older builds wrote host-only cookies (no Domain). A browser can hold those
 * next to the domain-wide ones and send them first, so a stale/foreign token
 * wins. A Domain-scoped Set-Cookie cannot delete them, hence the extra
 * host-only expiry. Only runs when the live cookies carry a Domain (or use
 * prefixed names), otherwise the regular write/clear already hits them.
 */
function clearLegacyHostOnlyCookies(
  res: Response,
  req: Request,
  domain: string | undefined,
): void {
  const names = resolveCookieNames(req);
  const base = {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
  };
  // Host-only legacy cookies only differ from the live ones when the live
  // ones carry a Domain or a non-prod name prefix.
  if (!domain && names.access === 'access_token') return;
  res.clearCookie('access_token', base);
  res.clearCookie('refresh_token', base);
  // Non-prod builds used to write host-only `dev_*` cookies on the API host.
  // Expire them so a stale (already rotated) refresh token cannot be sent
  // ahead of the live domain-wide one.
  if (domain && names.access !== 'access_token') {
    res.clearCookie(names.access, base);
    res.clearCookie(names.refresh, base);
  }
}

@Controller('auth')
export class AuthController {
  private readonly cookieKey: Buffer;
  private readonly cookieDomain: string | undefined;

  constructor(
    private readonly authService: AuthService,
    private readonly passwordReset: PasswordResetService,
    private readonly magicLink: MagicLinkService,
    configService: ConfigService,
  ) {
    this.cookieKey = cookieCipherKey(resolveJwtSecret(configService));
    this.cookieDomain = configService.get<string>('COOKIE_DOMAIN');
  }

  // Returns the provider tokens to the caller only. It must NOT set session
  // cookies: the Google tokens are not Arcadeum credentials, and only
  // /auth/oauth/login mints the real session.
  @Post('token')
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  async exchange(
    @Body() dto: TokenExchangeDto,
    @Headers('origin') originHeader?: string,
    @Headers('referer') refererHeader?: string,
  ): Promise<OAuthTokenResponse> {
    const requestOrigin = this.resolveRequestOrigin(
      originHeader,
      refererHeader,
    );
    const result = await this.authService.exchangeCode({
      code: dto.code,
      codeVerifier: dto.codeVerifier,
      redirectUri: dto.redirectUri,
      requestOrigin,
    });
    return result;
  }

  @Post('register')
  @Throttle({ auth: { limit: 5, ttl: 60_000 } })
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.authService.register(dto, req.ip);
  }

  @Get('check/username/:username')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async checkUsername(
    @Param('username') username: string,
  ): Promise<{ available: boolean }> {
    const result = await this.authService.checkUsernameAvailable(username);
    // Always return the same shape to prevent user enumeration
    return { available: result.available };
  }

  @Get('check/email/:email')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async checkEmail(
    @Param('email') email: string,
  ): Promise<{ available: boolean }> {
    const result = await this.authService.checkEmailAvailable(email);
    // Always return the same shape to prevent user enumeration
    return { available: result.available };
  }

  @Post('login')
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokensResponse> {
    const result = await this.authService.login(dto, req.ip);
    setTokenCookies(
      res,
      req,
      this.cookieKey,
      this.cookieDomain,
      result.accessToken,
      result.accessTokenExpiresAt,
      result.refreshToken,
      result.refreshTokenExpiresAt,
    );
    return result;
  }

  @Post('oauth/login')
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  async oauthLogin(
    @Body() dto: OAuthLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokensResponse> {
    const result = await this.authService.loginWithOAuth(dto, req.ip);
    setTokenCookies(
      res,
      req,
      this.cookieKey,
      this.cookieDomain,
      result.accessToken,
      result.accessTokenExpiresAt,
      result.refreshToken,
      result.refreshTokenExpiresAt,
    );
    return result;
  }

  @Post('refresh')
  @Throttle({ auth: { limit: 60, ttl: 60_000 } })
  async refresh(
    @Body() dto: RefreshTokenRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokensResponse> {
    const cookieToken = (req.cookies as Record<string, string>)?.[
      resolveCookieNames(req).refresh
    ];
    // Cookies written before this feature are plain text; accept them so
    // existing sessions survive the deploy and get re-encrypted on next
    // refresh.
    // The cookie is the source of truth (it is rotated on every refresh), so
    // it wins over a possibly stale body token; the body is the fallback for
    // clients without cookies (mobile).
    const fromCookie = cookieToken
      ? (decryptTokenCookie(cookieToken, this.cookieKey) ?? cookieToken)
      : '';
    const rawToken = fromCookie || dto.refreshToken || '';
    const result = await this.authService.refreshToken(rawToken);
    setTokenCookies(
      res,
      req,
      this.cookieKey,
      this.cookieDomain,
      result.accessToken,
      result.accessTokenExpiresAt,
      result.refreshToken,
      result.refreshTokenExpiresAt,
    );
    return result;
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): void {
    clearTokenCookies(res, req, this.cookieDomain);
  }

  // Account-enumeration defense: always 204, never reveal whether the email
  // mapped to a user. Rate-limited tightly because every request triggers
  // a DB write + outbound email when an account does exist.
  @Post('forgot')
  @HttpCode(204)
  @Throttle({ strict: { limit: 5, ttl: 60 * 60 * 1000 } })
  async forgot(@Body() dto: ForgotPasswordDto): Promise<void> {
    await this.passwordReset.requestReset(dto.email);
  }

  // Slightly more permissive than /forgot because a real user can mistype
  // a fresh password a few times before getting it right.
  @Post('reset')
  @Throttle({ strict: { limit: 10, ttl: 60 * 60 * 1000 } })
  async reset(@Body() dto: ResetPasswordDto): Promise<{ ok: true }> {
    const result = await this.passwordReset.consumeReset(
      dto.token,
      dto.password,
    );
    if (!result.ok) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.authService.getUserProfileById(user.userId);
  }

  @Post('magic-link')
  @HttpCode(200)
  @Throttle({ strict: { limit: 3, ttl: 60 * 60 * 1000 } })
  async requestMagicLink(
    @Body() dto: RequestMagicLinkDto,
  ): Promise<{ success: boolean }> {
    // Always returns 200 to prevent account enumeration
    return this.magicLink.requestMagicLink(dto.email);
  }

  @Post('magic-link/verify')
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  async verifyMagicLink(
    @Body() dto: VerifyMagicLinkDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokensResponse> {
    const result = await this.magicLink.verifyMagicLink(dto.token);
    setTokenCookies(
      res,
      req,
      this.cookieKey,
      this.cookieDomain,
      result.accessToken,
      result.accessTokenExpiresAt,
      result.refreshToken,
      result.refreshTokenExpiresAt,
    );
    return result;
  }

  @Get('users/search')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async searchUsers(
    @Req() req: Request,
    @Query('q') query?: string,
    @Query('includeSelf') includeSelf?: string,
  ) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.authService.searchUsers({
      query: query ?? '',
      requestingUserId: user.userId,
      includeSelf: includeSelf === 'true',
    });
  }

  @Get('users/:id')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  async getUserPublicProfile(@Param('id') id: string) {
    return this.authService.getPublicProfile(id);
  }

  @Post('block/:userId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async blockUser(
    @Req() req: Request,
    @Param('userId') blockedUserId: string,
  ): Promise<void> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }
    await this.authService.blockUser(user.userId, blockedUserId);
  }

  @Get('blocked')
  @UseGuards(JwtAuthGuard)
  async getBlockedUsers(@Req() req: Request) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.authService.getBlockedUsersWithDetails(user.userId);
  }

  @Delete('block/:userId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async unblockUser(
    @Req() req: Request,
    @Param('userId') blockedUserId: string,
  ): Promise<void> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }
    await this.authService.unblockUser(user.userId, blockedUserId);
  }

  private resolveRequestOrigin(
    originHeader?: string,
    refererHeader?: string,
  ): string | undefined {
    const parts = [originHeader, refererHeader];
    for (const candidate of parts) {
      const trimmed = candidate?.trim();
      if (!trimmed) continue;
      try {
        const url = new URL(trimmed);
        return url.origin;
      } catch {
        continue;
      }
    }
    return undefined;
  }
}
