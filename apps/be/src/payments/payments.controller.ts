import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentNotesService, PaginatedNotes } from './payment-notes.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { PaymentSession } from './interfaces/payment-session.interface';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string;
  email: string;
}

@Controller('payments')
export class PaymentsController {
  private readonly jwtService: JwtService;

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly notesService: PaymentNotesService,
    private readonly config: ConfigService,
  ) {
    const secret = this.config.get<string>('AUTH_JWT_SECRET');
    this.jwtService = new JwtService({ secret });
  }

  @Post('session')
  @HttpCode(HttpStatus.CREATED)
  createSession(@Body() dto: CreatePaymentDto): Promise<PaymentSession> {
    return this.paymentsService.createSession(dto);
  }

  @Post('subscription')
  @HttpCode(HttpStatus.CREATED)
  createSubscription(
    @Body() dto: CreateSubscriptionDto,
  ): Promise<PaymentSession> {
    return this.paymentsService.createSubscription(dto);
  }

  @Post('notes')
  @HttpCode(HttpStatus.CREATED)
  async createNote(@Body() dto: CreateNoteDto, @Req() req: Request) {
    const userId = this.extractUserId(req);
    return this.notesService.createNote(dto, userId);
  }

  @Get('notes')
  async getNotes(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedNotes> {
    const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
    const limitNum = Math.max(
      1,
      Math.min(100, parseInt(limit || '20', 10) || 20),
    );
    return this.notesService.getNotes(pageNum, limitNum);
  }

  private extractUserId(req: Request): string | undefined {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return undefined;
    }

    const token = authHeader.substring(7);
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      return payload.sub;
    } catch {
      return undefined;
    }
  }
}
