import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Season, SeasonSchema } from './schemas/season.schema';
import { RankingEntry, RankingEntrySchema } from '../ranking/ranking.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { OCI_CONNECTION } from '../common/providers/mongo-connections.provider';
import { SeasonsService } from './seasons.service';
import { SeasonsController } from './seasons.controller';
import { SeasonsRolloverCron } from './seasons.rollover.cron';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Season.name, schema: SeasonSchema },
        { name: RankingEntry.name, schema: RankingEntrySchema },
        { name: User.name, schema: UserSchema },
      ],
      OCI_CONNECTION,
    ),
  ],
  controllers: [SeasonsController],
  providers: [SeasonsService, SeasonsRolloverCron],
  exports: [SeasonsService],
})
export class SeasonsModule {}
