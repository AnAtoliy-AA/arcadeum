import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaguesController } from './leagues.controller';
import { WeeklyLeagueService } from './weekly-league.service';
import {
  WeeklyLeague,
  WeeklyLeagueSchema,
} from './schemas/weekly-league.schema';
import { WeeklyLeagueRolloverCron } from './weekly-league.rollover.cron';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WeeklyLeague.name, schema: WeeklyLeagueSchema },
    ]),
  ],
  controllers: [LeaguesController],
  providers: [WeeklyLeagueService, WeeklyLeagueRolloverCron],
  exports: [WeeklyLeagueService],
})
export class LeaguesModule {}
