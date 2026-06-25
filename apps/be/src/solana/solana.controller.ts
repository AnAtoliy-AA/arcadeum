import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { SolanaService } from './solana.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

@Controller('solana')
export class SolanaController {
  private readonly logger = new Logger(SolanaController.name);

  constructor(private readonly solana: SolanaService) {}

  @Get('token-metadata')
  async tokenMetadata() {
    return this.solana.getTokenMetadata();
  }

  @Get('platform-balance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async platformBalance() {
    return this.solana.getPlatformBalance();
  }

  @Post('verify-transaction')
  @UseGuards(JwtAuthGuard)
  async verifyTransaction(
    @Req() req: { user: AuthenticatedUser },
    @Body() body: { signature: string; amount: number; senderAddress: string },
  ) {
    const isValid = await this.solana.verifyTransaction(
      body.signature,
      body.amount,
      body.senderAddress,
    );

    return { valid: isValid };
  }
}
