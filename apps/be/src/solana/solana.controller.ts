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
import { ARCADEUM_DECIMALS } from './lib/arcadeum-token';
import { SolanaService } from './solana.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { EconomySettingsService } from '../economy/economy-settings.service';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { VerifyTransactionDto } from './dto/verify-transaction.dto';
import { ArcHealthService } from './lib/arc-health.service';

@Controller('solana')
export class SolanaController {
  private readonly logger = new Logger(SolanaController.name);

  constructor(
    private readonly solana: SolanaService,
    private readonly economy: EconomySettingsService,
    private readonly health: ArcHealthService,
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

  /** Public ARC identifiers so the web never hardcodes its own copy. */
  @Get('config')
  getConfig() {
    const cfg = this.solana.getRuntimeConfig();
    return {
      mintAddress: cfg.mint,
      poolAddress: cfg.poolAddress,
      decimals: ARCADEUM_DECIMALS,
      configured: cfg.mint !== null,
    };
  }

  @Get('pricing')
  async getPricing() {
    const [quote, gemToUsd, discountPercent, gemsAllowArc, shopAllowArc] =
      await Promise.all([
        this.solana.getArcadeumQuote(),
        this.economy.getNumber('gem_to_usd_rate'),
        this.economy.getNumber('arcadeum_discount_percent'),
        this.economy.getNumber('gems_allow_arcadeum'),
        this.economy.getNumber('shop_allow_arcadeum'),
      ]);

    // Checkout refuses stale prices, so only an `ok` quote is quotable here.
    // `stale` is shown for context but priced as unavailable (0).
    const arcUsdPrice = quote.status === 'ok' ? quote.priceUsd : 0;
    return {
      arcUsdPrice,
      priceStatus: quote.status,
      priceSource: quote.source,
      priceAgeSeconds:
        quote.ageMs === null ? null : Math.round(quote.ageMs / 1000),
      gemToUsdRate: gemToUsd,
      discountPercent,
      gemsAllowArc: gemsAllowArc === 1,
      shopAllowArc: shopAllowArc === 1,
    };
  }

  @Get('health')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getHealth() {
    return this.health.getHealth();
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
    const result = await this.solana.verifyTransactionDetailed(
      dto.signature,
      dto.amount,
      { senderAddress: dto.senderAddress },
    );

    return { valid: result.valid, reason: result.reason };
  }
}
