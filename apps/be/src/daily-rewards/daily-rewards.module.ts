import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyRewardsController } from './daily-rewards.controller';
import { DailyRewardsService } from './daily-rewards.service';
import {
  UserDailyReward,
  UserDailyRewardSchema,
} from './schemas/user-daily-reward.schema';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';
import { EconomyModule } from '../economy/economy.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { DailyRewardsNotificationCron } from './daily-rewards.notification.cron';

/**
 * DailyRewardsModule depends on:
 *  - WalletModule (to credit coins)
 *  - EconomyModule (to read tunable daily_reward_day_N values)
 *  - AuthModule  (JwtAuthGuard / passport strategy)
 *
 * We use forwardRef for AuthModule and WalletModule to mirror ReferralModule
 * and avoid any potential cycle (Auth → Referrals → Economy/Wallet etc.).
 * EconomyModule does NOT import Auth/Wallet so it can be imported directly.
 */
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: UserDailyReward.name, schema: UserDailyRewardSchema },
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => WalletModule),
    EconomyModule,
    NotificationsModule,
  ],
  controllers: [DailyRewardsController],
  providers: [DailyRewardsService, DailyRewardsNotificationCron],
  exports: [DailyRewardsService],
})
export class DailyRewardsModule {}
