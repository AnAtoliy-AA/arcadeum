import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { GeoBlockGuard } from '../common/guards/geo-block.guard';
import { SolanaPayService } from './lib/solana-pay.service';
import { CreateSolanaPayDto } from './dto/create-solana-pay.dto';
import type { PaymentRequest, PaymentStatus } from './lib/solana-pay.service';

type AuthedReq = { user: AuthenticatedUser };

@Controller('solana/pay')
@UseGuards(JwtAuthGuard, GeoBlockGuard)
export class SolanaPayController {
  constructor(private readonly solanaPay: SolanaPayService) {}

  @Post('create')
  create(
    @Req() req: AuthedReq,
    @Body() dto: CreateSolanaPayDto,
  ): PaymentRequest {
    return this.solanaPay.createPaymentRequest(
      req.user.userId,
      dto.amount,
      dto.tokenAddress,
    );
  }

  @Get('status/:sessionId')
  async status(
    @Req() req: AuthedReq,
    @Param('sessionId') sessionId: string,
  ): Promise<PaymentStatus> {
    return this.solanaPay.checkPaymentStatus(req.user.userId, sessionId);
  }

  @Post('watch/:sessionId')
  watch(@Req() req: AuthedReq, @Param('sessionId') sessionId: string) {
    const registered = this.solanaPay.registerCallback(
      req.user.userId,
      sessionId,
      () => {},
    );
    return { watching: registered };
  }
}
