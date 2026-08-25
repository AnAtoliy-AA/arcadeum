import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PaymentsService } from './payments.service';
import { PaymentNotesService, PaginatedNotes } from './payment-notes.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { PaymentSession } from './interfaces/payment-session.interface';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

// These endpoints are intentionally public (anonymous donations) but each
// PayPal order creation burns third-party API quota, so they get a tight
// per-IP budget on top of the global limiter.
const PAYMENT_CREATE_THROTTLE = { default: { limit: 10, ttl: 60_000 } };

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly notesService: PaymentNotesService,
  ) {}

  @Post('session')
  @Throttle(PAYMENT_CREATE_THROTTLE)
  @HttpCode(HttpStatus.CREATED)
  createSession(@Body() dto: CreatePaymentDto): Promise<PaymentSession> {
    return this.paymentsService.createSession(dto);
  }

  @Post('subscription')
  @Throttle(PAYMENT_CREATE_THROTTLE)
  @HttpCode(HttpStatus.CREATED)
  createSubscription(
    @Body() dto: CreateSubscriptionDto,
  ): Promise<PaymentSession> {
    return this.paymentsService.createSubscription(dto);
  }

  @Post('notes')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createNote(
    @Body() dto: CreateNoteDto,
    @Req() req: Request,
  ): Promise<unknown> {
    const user = req.user as AuthenticatedUser | undefined;
    return this.notesService.createNote(dto, user?.userId);
  }

  @Get('notes')
  @UseGuards(JwtAuthGuard)
  async getNotes(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedNotes> {
    const pageNum = parseInt(page || '0', 10) || 0;
    const limitNum = Math.max(
      1,
      Math.min(100, parseInt(limit || '20', 10) || 20),
    );
    return this.notesService.getNotes(pageNum, limitNum);
  }
}
