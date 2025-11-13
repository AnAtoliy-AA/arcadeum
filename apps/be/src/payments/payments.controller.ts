import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentSession } from './interfaces/payment-session.interface';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('session')
  @HttpCode(HttpStatus.CREATED)
  createSession(@Body() dto: CreatePaymentDto): Promise<PaymentSession> {
    return this.paymentsService.createSession(dto);
  }
}
