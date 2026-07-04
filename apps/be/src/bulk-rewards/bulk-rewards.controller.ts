import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';
import {
  BulkRewardsService,
  type BulkRewardResult,
} from './bulk-rewards.service';
import { BulkRewardDto } from './dto/bulk-reward.dto';

interface RequestWithUser {
  user: AuthenticatedUser;
}

@Controller('admin/bulk-rewards')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class BulkRewardsController {
  constructor(private readonly service: BulkRewardsService) {}

  @Post()
  rewardAllUsers(
    @Req() req: RequestWithUser,
    @Body() dto: BulkRewardDto,
  ): Promise<BulkRewardResult> {
    return this.service.rewardAllUsers(dto, req.user.userId);
  }
}
