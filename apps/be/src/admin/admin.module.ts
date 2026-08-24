import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/schemas/user.schema';
import {
  GameSession,
  GameSessionSchema,
} from '../games/schemas/game-session.schema';
import {
  PlayerStatRecord,
  PlayerStatRecordSchema,
} from '../games/schemas/player-stat-record.schema';
import { GameRoom, GameRoomSchema } from '../games/schemas/game-room.schema';
import {
  WalletTransaction,
  WalletTransactionSchema,
} from '../wallet/schemas/wallet-transaction.schema';
import {
  Tournament,
  TournamentSchema,
} from '../tournaments/schemas/tournament.schema';
import {
  GemPurchase,
  GemPurchaseSchema,
} from '../gems/schemas/gem-purchase.schema';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminController } from './admin.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminStatisticsService } from './admin-statistics.service';
import { GameVisibilityModule } from './game-visibility/game-visibility.module';
import { GameRuleVisibilityModule } from './game-visibility/game-rule-visibility.module';
import { AdminBlockedIpsController } from './admin-blocked-ips.controller';
import { IpBlockService } from '../common/guards/ip-block.guard';
import { RateStateModule } from '../common/rate-state';

@Module({
  imports: [
    AuthModule,
    RateStateModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: GameSession.name, schema: GameSessionSchema },
      { name: PlayerStatRecord.name, schema: PlayerStatRecordSchema },
      { name: GameRoom.name, schema: GameRoomSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
      { name: Tournament.name, schema: TournamentSchema },
      { name: GemPurchase.name, schema: GemPurchaseSchema },
    ]),
    GameVisibilityModule,
    GameRuleVisibilityModule,
  ],
  controllers: [
    AdminController,
    AdminUsersController,
    AdminBlockedIpsController,
  ],
  providers: [
    RolesGuard,
    AdminUsersService,
    AdminStatisticsService,
    IpBlockService,
  ],
  exports: [IpBlockService, AdminStatisticsService],
})
export class AdminModule {}
