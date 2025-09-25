import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenExchangeDto } from './dtos/token-exchange.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  async exchange(@Body() dto: TokenExchangeDto) {
    return await this.authService.exchangeCode({
      code: dto.code,
      codeVerifier: dto.codeVerifier,
      redirectUri: dto.redirectUri,
    });
  }
}
