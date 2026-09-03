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
import { PasswordResetService } from './services/password-reset.service';
import { ConfigService } from '@nestjs/config';
import { resolveJwtSecret } from '../common/utils/jwt-secret.util';
import {
  cookieCipherKey,
  decryptTokenCookie,
  encryptTokenCookie,
} from '../common/utils/token-cookie-cipher.util';

const COOKIE_MAX_AGE_15_MIN = 15 * 60 * 1000;
const COOKIE_MAX_AGE_30_DAYS = 30 * 24 * 60 * 60 * 1000;

function getCookieDomain(req: Request): string | undefined {
  const host = (req.get('host') ?? '').split(':')[0].toLowerCase();
  if (host === 'arcadeum.games' || host.endsWith('.arcadeum.games')) {
    return '.arcadeum.games';
  }
  return undefined;
}

function setTokenCookies(
  res: Response,
  req: Request,
  cookieKey: Buffer,
  accessToken: string,
  accessTokenExpiresAt: Date | null,
  refreshToken: string,
  refreshTokenExpiresAt: Date,
): void {
  const domain = getCookieDomain(req);
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
  res.cookie('access_token', encryptTokenCookie(accessToken, cookieKey), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    ...(domain ? { domain } : {}),
    path: '/',
    maxAge: Math.max(maxAgeAccess, 0),
  });
  res.cookie('refresh_token', encryptTokenCookie(refreshToken, cookieKey), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    ...(domain ? { domain } : {}),
    path: '/',
    maxAge: Math.max(maxAgeRefresh, 0),
  });
}

function clearTokenCookies(res: Response, req: Request): void {
  const domain = getCookieDomain(req);
  const options = {
    path: '/',
    httpOnly: true,
    // Must match the attributes the cookies were set with, otherwise
    // browsers won't match them for deletion.
    secure: true,
    sameSite: 'lax' as const,
    ...(domain ? { domain } : {}),
  };
  res.clearCookie('access_token', options);
  res.clearCookie('refresh_token', options);
}

@Controller('auth')
export class AuthController {
  private readonly cookieKey: Buffer;

  constructor(
    private readonly authService: AuthService,
    private readonly passwordReset: PasswordResetService,
    configService: ConfigService,
  ) {
    this.cookieKey = cookieCipherKey(resolveJwtSecret(configService));
  }

  @Post('token')
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  async exchange(
    @Body() dto: TokenExchangeDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
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
    setTokenCookies(
      res,
      req,
      this.cookieKey,
      result.accessToken,
      null,
      result.refreshToken ?? '',
      new Date(Date.now() + COOKIE_MAX_AGE_30_DAYS),
    );
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
    const cookieToken = (req.cookies as Record<string, string>)?.refresh_token;
    // Cookies written before this feature are plain text; accept them so
    // existing sessions survive the deploy and get re-encrypted on next
    // refresh.
    const rawToken =
      dto.refreshToken ||
      (cookieToken
        ? (decryptTokenCookie(cookieToken, this.cookieKey) ?? cookieToken)
        : '') ||
      '';
    const result = await this.authService.refreshToken(rawToken);
    setTokenCookies(
      res,
      req,
      this.cookieKey,
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
    clearTokenCookies(res, req);
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
