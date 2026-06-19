import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { SolanaService } from './solana.service';
import { WalletService } from '../wallet/wallet.service';
import { WithdrawDto } from './dto/withdraw.dto';
import { BuybackDto } from './dto/buyback.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { randomUUID } from 'crypto';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

const WITHDRAWAL_FEE_PERCENT = 2;

@Controller('solana')
export class SolanaController {
  private readonly logger = new Logger(SolanaController.name);

  constructor(
    private readonly solana: SolanaService,
    private readonly wallet: WalletService,
  ) {}

  @Get('platform-balance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async platformBalance() {
    return this.solana.getPlatformBalance();
  }

  @Post('withdraw')
  @UseGuards(JwtAuthGuard)
  @Throttle({ strict: { limit: 5, ttl: 3_600_000 } })
  async withdraw(
    @Req() req: { user: AuthenticatedUser },
    @Body() dto: WithdrawDto,
  ) {
    const userId = req.user.userId;
    const feeAmount = Math.ceil((dto.amount * WITHDRAWAL_FEE_PERCENT) / 100);
    const totalDeduction = dto.amount + feeAmount;

    const balance = await this.wallet.getBalance(userId);
    if (balance.arcadeum < totalDeduction) {
      throw new Error('Insufficient ARCADEUM balance');
    }

    // Transfer FIRST, then debit on success. This prevents funds from
    // being lost if the on-chain transaction fails.
    let signature: string;
    try {
      signature = await this.solana.transferArcadeum(
        dto.walletAddress,
        dto.amount,
      );
    } catch (err) {
      this.logger.error(
        `On-chain transfer failed for user ${userId}: ${err instanceof Error ? err.message : err}`,
      );
      throw new Error(
        'Blockchain transfer failed. Your balance was not changed.',
      );
    }

    // Debit only after successful on-chain confirmation
    await this.wallet.debit(
      userId,
      'arcadeum',
      dto.amount,
      'token_withdrawal',
      randomUUID(),
      {
        walletAddress: dto.walletAddress,
        amount: dto.amount,
        fee: feeAmount,
        signature,
      },
    );

    if (feeAmount > 0) {
      await this.wallet.debit(
        userId,
        'arcadeum',
        feeAmount,
        'token_withdrawal_fee',
        randomUUID(),
        {
          walletAddress: dto.walletAddress,
          withdrawalAmount: dto.amount,
        },
      );
    }

    return {
      success: true,
      signature,
      amount: dto.amount,
      fee: feeAmount,
      totalDeducted: totalDeduction,
    };
  }

  @Post('buyback')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async buyback(
    @Req() req: { user: AuthenticatedUser },
    @Body() dto: BuybackDto,
  ) {
    this.logger.log(
      `Buyback initiated: ${dto.solAmount} SOL by admin ${req.user.userId}`,
    );

    const [solPrice, arcadeumPrice] = await Promise.all([
      this.solana.getSolPrice(),
      this.solana.getArcadeumPrice(),
    ]);

    const solValueUsd = dto.solAmount * solPrice;
    const estimatedArcadeum =
      arcadeumPrice > 0 ? solValueUsd / arcadeumPrice : 0;

    return {
      success: true,
      message: 'Buyback estimate. DEX integration pending.',
      solAmount: dto.solAmount,
      solPriceUsd: solPrice,
      arcadeumPriceUsd: arcadeumPrice,
      estimatedArcadeum: Math.round(estimatedArcadeum * 100) / 100,
    };
  }
}
