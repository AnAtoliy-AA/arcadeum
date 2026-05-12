import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { PaymentNotesService } from './payment-notes.service';
import { ListAdminNotesDto } from './dto/list-admin-notes.dto';
import type { AdminPaymentNotesResponse } from './interfaces/admin-payment-note.interface';

@Controller('admin/payments/notes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminPaymentNotesController {
  constructor(private readonly notesService: PaymentNotesService) {}

  @Get()
  list(@Query() query: ListAdminNotesDto): Promise<AdminPaymentNotesResponse> {
    return this.notesService.listForAdmin(query);
  }
}
