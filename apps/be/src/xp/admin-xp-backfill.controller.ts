import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { BackfillXpService } from './backfill-xp.service';

@Controller('admin/xp-backfill')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminXpBackfillController {
  constructor(private readonly backfill: BackfillXpService) {}

  @Post()
  async run(@Query('dryRun') dryRun?: string) {
    const isDryRun = dryRun === 'true';
    return this.backfill.backfill(isDryRun);
  }
}
