import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppCacheModule } from './common/cache/app-cache.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PaymentsModule } from './payments/payments.module';
import { ReferralModule } from './referrals/referral.module';
import { LeaderboardsModule } from './leaderboards/leaderboards.module';
import { RankingModule } from './ranking/ranking.module';
import { AdminModule } from './admin/admin.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { WalletModule } from './wallet/wallet.module';
import { GemsModule } from './gems/gems.module';
import { EconomyModule } from './economy/economy.module';
import { DailyRewardsModule } from './daily-rewards/daily-rewards.module';
import { DailyChallengesModule } from './daily-challenges/daily-challenges.module';
import { AchievementsModule } from './achievements/achievements.module';
import { ShopModule } from './shop/shop.module';
import { BattlePassModule } from './battle-pass/battle-pass.module';
import { SupportModule } from './support/support.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BulkRewardsModule } from './bulk-rewards/bulk-rewards.module';
import { FriendsModule } from './friends/friends.module';
import { ClansModule } from './clans/clans.module';
import { EventsModule } from './events/events.module';
import { SeasonsModule } from './seasons/seasons.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import {
  resolveMongoUri,
  resolveMongoOptions,
  resolveAtlasUri,
} from './common/utils/mongo-uri.util';
import {
  OCI_CONNECTION,
  ATLAS_CONNECTION,
} from './common/providers/mongo-connections.provider';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { MessageCodeInterceptor } from './common/interceptors/message-code.interceptor';
import { GlobalThrottlerGuard } from './common/guards/global-throttler.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AppCacheModule,
    AuthModule,
    ChatModule,
    GamesModule,
    PaymentsModule,
    ReferralModule,
    LeaderboardsModule,
    RankingModule,
    AdminModule,
    AnnouncementsModule,
    TournamentsModule,
    WalletModule,
    GemsModule,
    EconomyModule,
    DailyRewardsModule,
    DailyChallengesModule,
    AchievementsModule,
    ShopModule,
    BattlePassModule,
    NotificationsModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: 100 },
      { name: 'auth', ttl: 60_000, limit: 10 },
      // Long window for abuse accounting, but blocks expire quickly so
      // accidental offenders (NAT'd users, pollers) recover in seconds.
      { name: 'strict', ttl: 3_600_000, limit: 5, blockDuration: 60_000 },
    ]),
    SupportModule,
    BulkRewardsModule,
    FriendsModule,
    ClansModule,
    EventsModule,
    SeasonsModule,
    MongooseModule.forRoot(resolveMongoUri(), {
      ...resolveMongoOptions(),
      connectionName: OCI_CONNECTION,
    }),
    ...(resolveAtlasUri()
      ? [
          MongooseModule.forRoot(resolveAtlasUri()!, {
            connectionName: ATLAS_CONNECTION,
            maxPoolSize: 30,
            serverSelectionTimeoutMS: 15_000,
            retryWrites: true,
            retryReads: true,
          }),
          MongooseModule.forRoot(resolveAtlasUri()!, resolveMongoOptions()),
        ]
      : [
          MongooseModule.forRoot(resolveMongoUri(), {
            ...resolveMongoOptions(),
            maxPoolSize: 5,
            minPoolSize: 1,
          }),
        ]),
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
    {
      provide: APP_GUARD,
      useClass: GlobalThrottlerGuard,
    },
  ],
})
export class AppModule {}
