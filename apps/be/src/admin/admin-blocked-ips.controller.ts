import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { IpBlockService } from '../common/guards/ip-block.guard';

@Controller('admin/blocked-ips')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminBlockedIpsController {
  constructor(private readonly ipBlockService: IpBlockService) {}

  @Get()
  list() {
    return this.ipBlockService.getBlocked();
  }

  @Delete(':ip')
  unblock(@Param('ip') ip: string) {
    const removed = this.ipBlockService.unblock(ip);
    return { ok: removed };
  }

  @Delete()
  clearAll() {
    this.ipBlockService.clearAll();
    return { ok: true };
  }
}
