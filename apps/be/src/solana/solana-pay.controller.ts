import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { GeoBlockGuard } from '../common/guards/geo-block.guard';
import { SolanaPayService } from './lib/solana-pay.service';
import { CreateSolanaPayDto } from './dto/create-solana-pay.dto';
import type { PaymentRequest, PaymentStatus } from './lib/solana-pay.service';

@Controller('solana/pay')
@UseGuards(JwtAuthGuard, GeoBlockGuard)
export class SolanaPayController {
  constructor(private readonly solanaPay: SolanaPayService) {}

  @Post('create')
  create(@Body() dto: CreateSolanaPayDto): PaymentRequest {
    return this.solanaPay.createPaymentRequest(dto.amount, dto.tokenAddress);
  }

  @Get('status/:sessionId')
  async status(@Param('sessionId') sessionId: string): Promise<PaymentStatus> {
    return this.solanaPay.checkPaymentStatus(sessionId);
  }

  @Post('watch/:sessionId')
  watch(@Param('sessionId') sessionId: string) {
    const registered = this.solanaPay.registerCallback(sessionId, () => {});
    return { watching: registered };
  }
}
