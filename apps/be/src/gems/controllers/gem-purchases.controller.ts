import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard';
import { GemPurchasesService } from '../services/gem-purchases.service';
import { CreateGemOrderDto } from '../dto/create-gem-order.dto';
import type { AuthenticatedUser } from '../../auth/jwt/jwt.strategy';

@Controller('payments/gems/orders')
@UseGuards(JwtAuthGuard)
export class GemPurchasesController {
  constructor(private readonly service: GemPurchasesService) {}

  @Post()
  create(
    @Req() req: { user: AuthenticatedUser },
    @Body() dto: CreateGemOrderDto,
  ) {
    return this.service.createOrder(req.user.userId, dto.packageId);
  }

  @Post(':orderId/finalize')
  finalize(
    @Req() req: { user: AuthenticatedUser },
    @Param('orderId') orderId: string,
  ) {
    return this.service.finalizeOrder(req.user.userId, orderId);
  }

  @Get('pending')
  pending(@Req() req: { user: AuthenticatedUser }) {
    return this.service.listPendingForUser(req.user.userId);
  }
}
