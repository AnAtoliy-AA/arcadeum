import { randomUUID } from 'crypto';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { WalletService } from './wallet.service';
import { GrantWalletDto } from './dto/grant-wallet.dto';
import { DeductWalletDto } from './dto/deduct-wallet.dto';
import { ListTransactionsDto } from './dto/list-transactions.dto';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

@Controller('admin/wallet/users/:userId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminWalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get('balance')
  balance(@Param('userId') userId: string) {
    return this.wallet.getBalance(userId);
  }

  @Get('transactions')
  transactions(
    @Param('userId') userId: string,
    @Query() query: ListTransactionsDto,
  ) {
    return this.wallet.getHistory(userId, query);
  }

  @Post('grant')
  grant(
    @Req() req: { user: AuthenticatedUser },
    @Param('userId') userId: string,
    @Body() dto: GrantWalletDto,
  ) {
    return this.wallet.credit(
      userId,
      dto.currency,
      dto.amount,
      'admin_grant',
      randomUUID(),
      { adminUserId: req.user.userId, note: dto.note },
    );
  }

  @Post('deduct')
  deduct(
    @Req() req: { user: AuthenticatedUser },
    @Param('userId') userId: string,
    @Body() dto: DeductWalletDto,
  ) {
    return this.wallet.debit(
      userId,
      dto.currency,
      dto.amount,
      'admin_deduct',
      randomUUID(),
      { adminUserId: req.user.userId, note: dto.note },
    );
  }
}
