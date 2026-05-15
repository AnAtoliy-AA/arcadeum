import { HttpException, HttpStatus } from '@nestjs/common';
import type { WalletCurrency } from '../interfaces/wallet-types';

export class InsufficientFundsException extends HttpException {
  constructor(currency: WalletCurrency, requested: number, available: number) {
    super(
      {
        message: 'wallet.insufficientFunds',
        currency,
        requested,
        available,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
