import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import { EngagementService, WinbackOffer } from './engagement.service';
import { RecordEngagementEventDto } from './dto/record-event.dto';
import { EngagementEvent } from './schemas/engagement-event.schema';

@Controller('engagement')
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Post('event')
  @UseGuards(JwtAuthGuard)
  async recordEvent(
    @Req() req: Request,
    @Body() dto: RecordEngagementEventDto,
  ): Promise<EngagementEvent> {
    const user = req.user as AuthenticatedUser;
    return this.engagementService.recordEvent(user.userId, dto);
  }

  @Get('triggers')
  @UseGuards(JwtAuthGuard)
  async getPendingTriggers(@Req() req: Request): Promise<EngagementEvent[]> {
    const user = req.user as AuthenticatedUser;
    return this.engagementService.getPendingTriggers(user.userId);
  }

  @Get('winback-offer')
  @UseGuards(JwtAuthGuard)
  getWinbackOffer(
    @Query('daysInactive') daysInactive?: string,
  ): WinbackOffer | null {
    const days = daysInactive ? Math.max(0, parseInt(daysInactive, 10)) : 0;
    return this.engagementService.evaluateWinbackOffer(days);
  }

  @Post('triggers/:id/claim')
  @UseGuards(JwtAuthGuard)
  async claimTrigger(
    @Req() req: Request,
    @Param('id') triggerId: string,
  ): Promise<EngagementEvent> {
    const user = req.user as AuthenticatedUser;
    return this.engagementService.claimTrigger(user.userId, triggerId);
  }
}
