import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GamesController } from './games.controller';
import { GamesHistoryController } from './games.history.controller';
import { GamesService } from './games.service';
import { GameRoom, GameRoomSchema } from './schemas/game-room.schema';
import { GameSession, GameSessionSchema } from './schemas/game-session.schema';
import {
  GameHistoryHidden,
  GameHistoryHiddenSchema,
} from './schemas/game-history-hidden.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { GamesRealtimeService } from './games.realtime.service';
import { GamesGateway } from './games.gateway';
import { CriticalGateway } from './critical.gateway';
import { CriticalActionsGateway } from './critical-actions.gateway';
import { TexasHoldemGateway } from './texas-holdem.gateway';
import { SeaBattleGateway } from './sea-battle.gateway';
import { GameEnginesModule } from './engines/engines.module';
import { GameRoomsService } from './rooms/game-rooms.service';
import { GameRoomsMapper } from './rooms/game-rooms.mapper';
import { GameRoomsRematchService } from './rooms/game-rooms.rematch.service';
import { GameRoomsQuickplayService } from './rooms/game-rooms.quickplay.service';
import { SeaBattleTeamConfigService } from './rooms/sea-battle-team-config.service';
import { GameSessionsService } from './sessions/game-sessions.service';
import { GameHistoryService } from './history/game-history.service';
import { GameHistoryBuilderService } from './history/game-history-builder.service';
import { GameHistoryStatsService } from './history/game-history-stats.service';
import { CriticalActionsService } from './actions/critical/critical-actions.service';
import { TexasHoldemActionsService } from './actions/texas-holdem/texas-holdem-actions.service';
import { GameUtilitiesService } from './utilities/game-utilities.service';
import { GamesRematchService } from './games.rematch.service';
import { GamesLeaderboardSyncService } from './games.leaderboard-sync.service';
import { GamePostMatchService } from './game-post-match.service';
import { DailyChallengesModule } from '../daily-challenges/daily-challenges.module';
import { AchievementsModule } from '../achievements/achievements.module';

import { CriticalService } from './critical/critical.service';
import { CriticalBotService } from './critical/critical-bot.service';
import { TexasHoldemService } from './texas-holdem/texas-holdem.service';
import { SeaBattleService } from './sea-battle/sea-battle.service';
import { SeaBattleBotService } from './sea-battle/sea-battle-bot.service';
import { GlimwormGateway } from './glimworm.gateway';
import { GlimwormService } from './glimworm/glimworm.service';
import { GlimwormBotService } from './glimworm/glimworm-bot.service';
import { GlimwormStateStore } from './glimworm/glimworm.state';
import { TicTacToeGateway } from './tic-tac-toe.gateway';
import { TicTacToeService } from './tic-tac-toe/tic-tac-toe.service';
import { TicTacToeBotService } from './tic-tac-toe/tic-tac-toe-bot.service';
import { CascadeGateway } from './cascade.gateway';
import { CascadeService } from './cascade/cascade.service';
import { CascadeBotService } from './cascade/cascade-bot.service';
import { AuthModule } from '../auth/auth.module';
import { LeaderboardsModule } from '../leaderboards/leaderboards.module';
import { WalletModule } from '../wallet/wallet.module';
import { EconomyModule } from '../economy/economy.module';
import { GameVisibilityModule } from '../admin/game-visibility/game-visibility.module';
// Note: GamesModule ↔ LeaderboardsModule is a circular dep
// (LeaderboardsService.markInMatch is called from GamesService when matches
// start/end; LeaderboardsService.getSnapshot now reads stats from
// GameHistoryStatsService). Both sides use forwardRef to break the cycle.

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GameRoom.name, schema: GameRoomSchema },
      { name: GameSession.name, schema: GameSessionSchema },
      { name: GameHistoryHidden.name, schema: GameHistoryHiddenSchema },
      { name: User.name, schema: UserSchema },
    ]),
    GameEnginesModule, // Import the game engines module
    forwardRef(() => AuthModule), // Import AuthModule for AuthService
    forwardRef(() => LeaderboardsModule),
    WalletModule,
    EconomyModule,
    GameVisibilityModule,
    DailyChallengesModule,
    AchievementsModule,
  ],
  controllers: [GamesController, GamesHistoryController],
  providers: [
    // Core services
    GameRoomsService,
    GameRoomsMapper,
    GameRoomsRematchService,
    GameRoomsQuickplayService,
    SeaBattleTeamConfigService,
    GameSessionsService,
    GameHistoryService,
    GameHistoryBuilderService,
    GameHistoryStatsService,
    GamesRealtimeService,
    // Game-specific action handlers
    CriticalActionsService,
    TexasHoldemActionsService,
    // Game-specific services (New)
    CriticalService,
    CriticalBotService,
    TexasHoldemService,
    SeaBattleService,
    SeaBattleBotService,
    // Glimworm
    GlimwormStateStore,
    GlimwormService,
    GlimwormBotService,
    // Tic-Tac-Toe
    TicTacToeService,
    TicTacToeBotService,
    // Cascade
    CascadeService,
    CascadeBotService,
    // Utilities
    GameUtilitiesService,
    // Facade service (main entry point)
    GamesService,
    GamesRematchService,
    GamesLeaderboardSyncService,
    GamePostMatchService,
    // Gateways
    GamesGateway,
    CriticalGateway,
    CriticalActionsGateway,
    TexasHoldemGateway,
    SeaBattleGateway,
    GlimwormGateway,
    TicTacToeGateway,
    CascadeGateway,
  ],
  exports: [GameHistoryStatsService],
})
export class GamesModule {}
