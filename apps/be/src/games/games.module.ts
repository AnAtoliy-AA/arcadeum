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
import { ExplodingCatsGateway } from './exploding-cats.gateway';
import { TexasHoldemGateway } from './texas-holdem.gateway';
import { GameEnginesModule } from './engines/engines.module';
import { GameRoomsService } from './rooms/game-rooms.service';
import { GameRoomsMapper } from './rooms/game-rooms.mapper';
import { GameRoomsRematchService } from './rooms/game-rooms.rematch.service';
import { GameSessionsService } from './sessions/game-sessions.service';
import { GameHistoryService } from './history/game-history.service';
import { GameHistoryBuilderService } from './history/game-history-builder.service';
import { ExplodingCatsActionsService } from './actions/exploding-cats/exploding-cats-actions.service';
import { TexasHoldemActionsService } from './actions/texas-holdem/texas-holdem-actions.service';
import { GameUtilitiesService } from './utilities/game-utilities.service';

import { ExplodingCatsService } from './exploding-cats/exploding-cats.service';
import { TexasHoldemService } from './texas-holdem/texas-holdem.service';
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
    GamesRealtimeService,
    // Game-specific action handlers
    ExplodingCatsActionsService,
    TexasHoldemActionsService,
    // Game-specific services (New)
    ExplodingCatsService,
    TexasHoldemService,
    // Utilities
    GameUtilitiesService,
    // Facade service (main entry point)
    GamesService,
    // Gateways
    GamesGateway,
    ExplodingCatsGateway,
    TexasHoldemGateway,
  ],
})
export class GamesModule {}
