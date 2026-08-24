import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { GamesController } from './games.controller';
import { GamesCatalogService } from './games-catalog.service';
import { GamesHistoryController } from './games.history.controller';
import { GamesService } from './games.service';
import { GamesHistoryFacade } from './games-history.facade';
import { GameRoom, GameRoomSchema } from './schemas/game-room.schema';
import { GameSession, GameSessionSchema } from './schemas/game-session.schema';
import {
  GameHistoryHidden,
  GameHistoryHiddenSchema,
} from './schemas/game-history-hidden.schema';
import { PlayerStats, PlayerStatsSchema } from './schemas/player-stats.schema';
import {
  PlayerStatRecord,
  PlayerStatRecordSchema,
} from './schemas/player-stat-record.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { GamesRealtimeService } from './games.realtime.service';
import { GamesGateway } from './games.gateway';
import { CriticalGateway } from './critical.gateway';
import { CriticalActionsGateway } from './critical-actions.gateway';
import { TexasHoldemGateway } from './texas-holdem.gateway';
import { SeaBattleGateway } from './sea-battle.gateway';
// Game handlers — plain services, not gateways (single-namespace architecture)
import { GameEnginesModule } from './engines/engines.module';
import { AiVsAiService } from './ai-vs-ai/ai-vs-ai.service';
import { GameRoomsService } from './rooms/game-rooms.service';
import { GameRoomsMapper } from './rooms/game-rooms.mapper';
import { GameRoomsRematchService } from './rooms/game-rooms.rematch.service';
import { GameRoomsChatService } from './rooms/game-rooms.chat.service';
import { GameRoomsQuickplayService } from './rooms/game-rooms.quickplay.service';
import { GameRoomsMatchmakingService } from './rooms/game-rooms.matchmaking.service';
import { SeaBattleTeamConfigService } from './rooms/sea-battle-team-config.service';
import { GameSessionsService } from './sessions/game-sessions.service';
import { GameSessionsArchiveService } from './sessions/game-sessions.archive.service';
import { GameSessionsCleanupCron } from './sessions/game-sessions.cleanup.cron';
import { GameHistoryService } from './history/game-history.service';
import { GameHistoryBuilderService } from './history/game-history-builder.service';
import { GameHistoryStatsService } from './history/game-history-stats.service';
import { GameHistoryRematchService } from './history/game-history-rematch.service';
import { CriticalActionsService } from './actions/critical/critical-actions.service';
import { TexasHoldemActionsService } from './actions/texas-holdem/texas-holdem-actions.service';
import { GameUtilitiesService } from './utilities/game-utilities.service';
import { GamesRematchService } from './games.rematch.service';
import { GamesLeaderboardSyncService } from './games.leaderboard-sync.service';
import { GamePostMatchService } from './game-post-match.service';
import { PlayerStatsService } from './player-stats.service';
import { DailyChallengesModule } from '../daily-challenges/daily-challenges.module';
import { AchievementsModule } from '../achievements/achievements.module';
import {
  OCI_CONNECTION,
  ATLAS_CONNECTION,
} from '../common/providers/mongo-connections.provider';
import { resolveAtlasUri } from '../common/utils/mongo-uri.util';
import { AntiCollusionService } from './common/anti-collusion.service';

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
import { ChessGateway } from './chess.gateway';
import { ChessService } from './chess/chess.service';
import { ChessBotService } from './engines/chess/chess-bot.service';
import { CheckersGateway } from './checkers.gateway';
import { CheckersService } from './checkers/checkers.service';
import { CheckersBotService } from './checkers/checkers-bot.service';
import { CatDashService } from './cat-dash/cat-dash.service';
import { CatDashBotService } from './cat-dash/cat-dash-bot.service';
import { CatDashGateway } from './cat-dash.gateway';
import { BackgammonService } from './backgammon/backgammon.service';
import { BackgammonBotService } from './backgammon/backgammon-bot.service';
import { BackgammonGateway } from './backgammon.gateway';
import { HeartsService } from './hearts/hearts.service';
import { HeartsBotService } from './hearts/hearts-bot.service';
import { HeartsGateway } from './hearts.gateway';
import { SpadesService } from './spades/spades.service';
import { SpadesBotService } from './spades/spades-bot.service';
import { SpadesGateway } from './spades.gateway';
import { GoService } from './go/go.service';
import { GoBotService } from './go/go-bot.service';
import { GoGateway } from './go.gateway';
import { PachisiService } from './pachisi/pachisi.service';
import { PachisiBotService } from './pachisi/pachisi-bot.service';
import { PachisiGateway } from './pachisi.gateway';
import { GameReplayService } from './replays/game-replay.service';
import { GameReplayController } from './replays/game-replay.controller';
import { GameReplay, GameReplaySchema } from './schemas/game-replay.schema';
import { AuthModule } from '../auth/auth.module';
import { LeaderboardsModule } from '../leaderboards/leaderboards.module';
import { RankingModule } from '../ranking/ranking.module';
import { WalletModule } from '../wallet/wallet.module';
import { EconomyModule } from '../economy/economy.module';
import { GameVisibilityModule } from '../admin/game-visibility/game-visibility.module';
import { GameRuleVisibilityModule } from '../admin/game-visibility/game-rule-visibility.module';
import { resolveJwtSecret } from '../common/utils/jwt-secret.util';
// Note: GamesModule ↔ LeaderboardsModule is a circular dep
// (LeaderboardsService.markInMatch is called from GamesService when matches
// start/end; LeaderboardsService.getSnapshot now reads stats from
// GameHistoryStatsService). Both sides use forwardRef to break the cycle.

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: resolveJwtSecret(config),
      }),
    }),
    // OCI connection models (fast, local gameplay)
    MongooseModule.forFeature(
      [
        { name: GameSession.name, schema: GameSessionSchema },
        { name: GameRoom.name, schema: GameRoomSchema },
        { name: GameReplay.name, schema: GameReplaySchema },
        { name: User.name, schema: UserSchema },
        { name: PlayerStats.name, schema: PlayerStatsSchema },
        { name: PlayerStatRecord.name, schema: PlayerStatRecordSchema },
      ],
      OCI_CONNECTION,
    ),
    // Default connection models (for services that inject without connectionName)
    MongooseModule.forFeature([
      { name: PlayerStats.name, schema: PlayerStatsSchema },
      { name: PlayerStatRecord.name, schema: PlayerStatRecordSchema },
    ]),
    // Atlas connection models (archive, history, stats) — only when Atlas is configured
    ...(resolveAtlasUri()
      ? [
          MongooseModule.forFeature(
            [
              { name: GameSession.name, schema: GameSessionSchema },
              { name: GameRoom.name, schema: GameRoomSchema },
              { name: GameHistoryHidden.name, schema: GameHistoryHiddenSchema },
              { name: PlayerStats.name, schema: PlayerStatsSchema },
              { name: PlayerStatRecord.name, schema: PlayerStatRecordSchema },
              { name: User.name, schema: UserSchema },
            ],
            ATLAS_CONNECTION,
          ),
        ]
      : []),
    GameEnginesModule, // Import the game engines module
    forwardRef(() => AuthModule), // Import AuthModule for AuthService
    forwardRef(() => LeaderboardsModule),
    RankingModule,
    WalletModule,
    EconomyModule,
    GameVisibilityModule,
    GameRuleVisibilityModule,
    DailyChallengesModule,
    AchievementsModule,
  ],
  controllers: [GamesController, GamesHistoryController, GameReplayController],
  providers: [
    // Core services
    GameRoomsService,
    GameRoomsMapper,
    GameRoomsRematchService,
    GameRoomsChatService,
    GameRoomsQuickplayService,
    GameRoomsMatchmakingService,
    SeaBattleTeamConfigService,
    GameSessionsService,
    GameSessionsArchiveService,
    GameSessionsCleanupCron,
    GameHistoryService,
    GameHistoryBuilderService,
    GameHistoryStatsService,
    GameHistoryRematchService,
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
    // Chess
    ChessService,
    ChessBotService,
    // Checkers
    CheckersService,
    CheckersBotService,
    // Cat Dash
    CatDashService,
    CatDashBotService,
    // Backgammon
    BackgammonService,
    BackgammonBotService,
    // Hearts
    HeartsService,
    HeartsBotService,
    // Spades
    SpadesService,
    SpadesBotService,
    // Go
    GoService,
    GoBotService,
    // Pachisi
    PachisiService,
    PachisiBotService,
    // AI vs AI
    AiVsAiService,
    // Utilities
    GameUtilitiesService,
    // Facade service (main entry point)
    GamesService,
    GamesHistoryFacade,
    GamesCatalogService,
    GamesRematchService,
    GamesLeaderboardSyncService,
    GamePostMatchService,
    GameReplayService,
    PlayerStatsService,
    // Gateways
    GamesGateway,
    CriticalGateway,
    CriticalActionsGateway,
    TexasHoldemGateway,
    SeaBattleGateway,
    GlimwormGateway,
    TicTacToeGateway,
    CascadeGateway,
    ChessGateway,
    CheckersGateway,
    CatDashGateway,
    BackgammonGateway,
    // Hearts (gateway registered as provider, not exported)
    HeartsGateway,
    SpadesGateway,
    GoGateway,
    PachisiGateway,
    AntiCollusionService,
  ],
  exports: [
    GameHistoryStatsService,
    GameRoomsMatchmakingService,
    AntiCollusionService,
  ],
})
export class GamesModule {}
