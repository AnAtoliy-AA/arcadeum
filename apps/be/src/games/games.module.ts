import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GamesController } from './games.controller';
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
import { TexasHoldemGateway } from './texas-holdem.gateway';
import { SeaBattleGateway } from './sea-battle.gateway';
import { GameEnginesModule } from './engines/engines.module';
import { GameRoomsService } from './rooms/game-rooms.service';
import { GameRoomsMapper } from './rooms/game-rooms.mapper';
import { GameRoomsRematchService } from './rooms/game-rooms.rematch.service';
import { GameSessionsService } from './sessions/game-sessions.service';
import { GameHistoryService } from './history/game-history.service';
import { GameHistoryBuilderService } from './history/game-history-builder.service';
import { GameHistoryStatsService } from './history/game-history-stats.service';
import { CriticalActionsService } from './actions/critical/critical-actions.service';
import { TexasHoldemActionsService } from './actions/texas-holdem/texas-holdem-actions.service';
import { GameUtilitiesService } from './utilities/game-utilities.service';
import { GamesRematchService } from './games.rematch.service';

import { CriticalService } from './critical/critical.service';
import { CriticalBotService } from './critical/critical-bot.service';
import { TexasHoldemService } from './texas-holdem/texas-holdem.service';
import { SeaBattleService } from './sea-battle/sea-battle.service';
import { SeaBattleBotService } from './sea-battle/sea-battle-bot.service';
import { AuthModule } from '../auth/auth.module';

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
  ],
  controllers: [GamesController],
  providers: [
    // Core services
    GameRoomsService,
    GameRoomsMapper,
    GameRoomsRematchService,
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
    // Utilities
    GameUtilitiesService,
    // Facade service (main entry point)
    GamesService,
    GamesRematchService,
    // Gateways
    GamesGateway,
    CriticalGateway,
    TexasHoldemGateway,
    SeaBattleGateway,
  ],
})
export class GamesModule {}
