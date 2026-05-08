import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaderboardsController } from './leaderboards.controller';
import { LeaderboardsService } from './leaderboards.service';
import { LeaderboardsSeederService } from './leaderboards.seeder';
import { LeaderboardsCaptureService } from './leaderboards.capture.service';
import { LeaderboardsGateway } from './leaderboards.gateway';
import {
  LeaderboardEntry,
  LeaderboardEntrySchema,
} from './schemas/leaderboard-entry.schema';
import { Cup, CupSchema } from './schemas/cup.schema';
import { Squad, SquadSchema } from './schemas/squad.schema';
import { TickerEvent, TickerEventSchema } from './schemas/ticker-event.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeaderboardEntry.name, schema: LeaderboardEntrySchema },
      { name: Cup.name, schema: CupSchema },
      { name: Squad.name, schema: SquadSchema },
      { name: TickerEvent.name, schema: TickerEventSchema },
    ]),
    AuthModule,
  ],
  controllers: [LeaderboardsController],
  providers: [
    LeaderboardsService,
    LeaderboardsSeederService,
    LeaderboardsCaptureService,
    LeaderboardsGateway,
  ],
  exports: [LeaderboardsService],
})
export class LeaderboardsModule {}
