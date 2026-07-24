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
import { EconomySettingsService } from '../economy/economy-settings.service';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { VerifyTransactionDto } from './dto/verify-transaction.dto';

@Controller('solana')
export class SolanaController {
  private readonly logger = new Logger(SolanaController.name);

  constructor(
    private readonly solana: SolanaService,
    private readonly economy: EconomySettingsService,
  ) {}

  @Get('token-metadata')
  async tokenMetadata() {
    const [metadata, balance] = await Promise.allSettled([
      this.solana.getTokenMetadata(),
      this.solana.getPlatformBalance(),
    ]);

    const meta = metadata.status === 'fulfilled' ? metadata.value : null;
    const bal = balance.status === 'fulfilled' ? balance.value : null;

    return { ...meta, treasuryBalance: bal };
  }

  @Get('pricing')
  async getPricing() {
    const [arcUsdPrice, gemToUsd, discountPercent, gemsAllowArc, shopAllowArc] =
      await Promise.all([
        this.solana.getArcadeumPrice(),
        this.economy.getNumber('gem_to_usd_rate'),
        this.economy.getNumber('arcadeum_discount_percent'),
        this.economy.getNumber('gems_allow_arcadeum'),
        this.economy.getNumber('shop_allow_arcadeum'),
      ]);

    return {
      arcUsdPrice,
      gemToUsdRate: gemToUsd,
      discountPercent,
      gemsAllowArc: gemsAllowArc === 1,
      shopAllowArc: shopAllowArc === 1,
    };
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
    @Body() dto: VerifyTransactionDto,
  ) {
    const isValid = await this.solana.verifyTransaction(
      dto.signature,
      dto.amount,
      dto.senderAddress,
    );

    return { valid: isValid };
  }
}
