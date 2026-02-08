import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Req,
  UnauthorizedException,
  Query,
  Headers,
  HttpCode,
} from '@nestjs/common';
import type { Request } from 'express';
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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  async exchange(
    @Body() dto: TokenExchangeDto,
    @Headers('origin') originHeader?: string,
    @Headers('referer') refererHeader?: string,
  ): Promise<OAuthTokenResponse> {
    const requestOrigin = this.resolveRequestOrigin(
      originHeader,
      refererHeader,
    );
    return await this.authService.exchangeCode({
      code: dto.code,
      codeVerifier: dto.codeVerifier,
      redirectUri: dto.redirectUri,
      requestOrigin,
    });
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('check/username/:username')
  checkUsername(
    @Param('username') username: string,
  ): Promise<{ available: boolean }> {
    return this.authService.checkUsernameAvailable(username);
  }

  @Get('check/email/:email')
  checkEmail(@Param('email') email: string): Promise<{ available: boolean }> {
    return this.authService.checkEmailAvailable(email);
  }

  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthTokensResponse> {
    return this.authService.login(dto);
  }

  @Post('oauth/login')
  oauthLogin(@Body() dto: OAuthLoginDto): Promise<AuthTokensResponse> {
    return this.authService.loginWithOAuth(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenRequestDto): Promise<AuthTokensResponse> {
    return this.authService.refreshToken(dto.refreshToken);
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
  async searchUsers(@Req() req: Request, @Query('q') query?: string) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.authService.searchUsers({
      query: query ?? '',
      requestingUserId: user.userId,
    });
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
