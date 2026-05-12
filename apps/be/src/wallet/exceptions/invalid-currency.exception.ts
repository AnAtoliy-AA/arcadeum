import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCurrencyException extends HttpException {
  constructor(received: string) {
    super(
      { message: 'wallet.invalidCurrency', received },
      HttpStatus.BAD_REQUEST,
    );
  }
}
