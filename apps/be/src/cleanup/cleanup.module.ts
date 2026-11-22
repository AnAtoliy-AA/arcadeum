import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CleanupService } from './cleanup.service';
import { CleanupCron } from './cleanup.cron';
import {
  GameSession,
  GameSessionSchema,
} from '../games/schemas/game-session.schema';
import { GameRoom, GameRoomSchema } from '../games/schemas/game-room.schema';
import { Message, MessageSchema } from '../chat/schemas/message.schema';
import { EconomyModule } from '../economy/economy.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GameSession.name, schema: GameSessionSchema },
      { name: GameRoom.name, schema: GameRoomSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    EconomyModule,
  ],
  providers: [CleanupService, CleanupCron],
  exports: [CleanupService],
})
export class CleanupModule {}
