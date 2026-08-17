import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { RankingEntry, RankingEntrySchema } from './ranking.schema';
import {
  PlayerStats,
  PlayerStatsSchema,
} from '../games/schemas/player-stats.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { OCI_CONNECTION } from '../common/providers/mongo-connections.provider';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: RankingEntry.name, schema: RankingEntrySchema },
        { name: PlayerStats.name, schema: PlayerStatsSchema },
        { name: User.name, schema: UserSchema },
      ],
      OCI_CONNECTION,
    ),
  ],
  controllers: [RankingController],
  providers: [RankingService],
  exports: [RankingService],
})
export class RankingModule {}
