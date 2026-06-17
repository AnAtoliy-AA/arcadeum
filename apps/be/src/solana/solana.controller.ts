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
  @UseGuards(JwtAuthGuard)
  async platformBalance() {
    return this.solana.getPlatformBalance();
  }

  @Post('withdraw')
  @UseGuards(JwtAuthGuard)
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

    const signature = await this.solana.transferArcadeum(
      dto.walletAddress,
      dto.amount,
    );

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
  buyback(@Req() req: { user: AuthenticatedUser }, @Body() dto: BuybackDto) {
    this.logger.log(
      `Buyback initiated: ${dto.solAmount} SOL by admin ${req.user.userId}`,
    );
    return {
      success: true,
      message: 'Buyback endpoint ready. Implement DEX integration.',
      solAmount: dto.solAmount,
    };
  }
}
