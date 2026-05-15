import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { WalletService } from './wallet.service';
import { ListTransactionsDto } from './dto/list-transactions.dto';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get('balance')
  async balance(@Req() req: { user: AuthenticatedUser }) {
    return this.wallet.getBalance(req.user.userId);
  }

  @Get('transactions')
  async transactions(
    @Req() req: { user: AuthenticatedUser },
    @Query() query: ListTransactionsDto,
  ) {
    return this.wallet.getHistory(req.user.userId, query);
  }
}
