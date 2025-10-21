import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { GameRoom, GameRoomSchema } from './schemas/game-room.schema';
import { GameSession, GameSessionSchema } from './schemas/game-session.schema';
import { GamesRealtimeService } from './games.realtime.service';
import { GamesGateway } from './games.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GameRoom.name, schema: GameRoomSchema },
      { name: GameSession.name, schema: GameSessionSchema },
    ]),
  ],
  controllers: [GamesController],
  providers: [GamesService, GamesRealtimeService, GamesGateway],
  exports: [GamesService],
})
export class GamesModule {}
