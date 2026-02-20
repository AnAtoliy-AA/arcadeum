import { Controller, Get, Param } from '@nestjs/common';
import { ReferralService } from './referral.service';

@Controller('referrals')
export class BadgesController {
  constructor(private readonly referralService: ReferralService) {}

  @Get('badges/:userId')
  async getUserBadges(@Param('userId') userId: string) {
    const stats = await this.referralService.getReferralStats(userId);
    const badges = stats.rewards.filter((r) => r.rewardType === 'badge');
    return { badges };
  }
}
