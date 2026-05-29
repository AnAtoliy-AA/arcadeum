import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { PaymentsModule } from './payments/payments.module';
import { ReferralModule } from './referrals/referral.module';
import { LeaderboardsModule } from './leaderboards/leaderboards.module';
import { AdminModule } from './admin/admin.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { WalletModule } from './wallet/wallet.module';
import { GemsModule } from './gems/gems.module';
import { EconomyModule } from './economy/economy.module';
import { DailyRewardsModule } from './daily-rewards/daily-rewards.module';
import { ShopModule } from './shop/shop.module';
import { BattlePassModule } from './battle-pass/battle-pass.module';
import { SupportModule } from './support/support.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import {
  resolveMongoUri,
  resolveMongoOptions,
} from './common/utils/mongo-uri.util';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { MessageCodeInterceptor } from './common/interceptors/message-code.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ChatModule,
    AuthModule,
    GamesModule,
    PaymentsModule,
    ReferralModule,
    LeaderboardsModule,
    AdminModule,
    AnnouncementsModule,
    TournamentsModule,
    WalletModule,
    GemsModule,
    EconomyModule,
    DailyRewardsModule,
    ShopModule,
    BattlePassModule,
    NotificationsModule,
    ScheduleModule.forRoot(),
    // Default ttl/limit are placeholders — the SupportController declares
    // its own @Throttle override. ThrottlerGuard is only applied at the
    // controller level (not as APP_GUARD) so other routes are unaffected.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    SupportModule,
    MongooseModule.forRoot(resolveMongoUri(), resolveMongoOptions()),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MessageCodeInterceptor,
    },
  ],
})
export class AppModule {}
