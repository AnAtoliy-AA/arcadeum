import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { Tournament, TournamentSchema } from './schemas/tournament.schema';
import {
  TournamentSetting,
  TournamentSettingSchema,
} from './schemas/tournament-setting.schema';
import { TournamentsService } from './tournaments.service';
import { TournamentsBracketsService } from './tournaments.brackets.service';
import { AdminTournamentsController } from './admin-tournaments.controller';
import { PublicTournamentsController } from './public-tournaments.controller';
import { TournamentsBootstrap } from './lib/tournaments-bootstrap';
import { NotificationsModule } from '../notifications/notifications.module';
import { TournamentsNotificationCron } from './tournaments.notification.cron';
import { SeaBattleBlitzService } from './sea-battle-blitz/sea-battle-blitz.service';
import { SeaBattleBlitzCron } from './sea-battle-blitz/sea-battle-blitz.cron';

@Module({
  imports: [
    AuthModule,
    WalletModule,
    MongooseModule.forFeature([
      { name: Tournament.name, schema: TournamentSchema },
      { name: User.name, schema: UserSchema },
      { name: TournamentSetting.name, schema: TournamentSettingSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [AdminTournamentsController, PublicTournamentsController],
  providers: [
    TournamentsService,
    TournamentsBracketsService,
    RolesGuard,
    TournamentsBootstrap,
    TournamentsNotificationCron,
    SeaBattleBlitzService,
    SeaBattleBlitzCron,
  ],
  exports: [
    TournamentsService,
    TournamentsBracketsService,
    SeaBattleBlitzService,
  ],
})
export class TournamentsModule {}
