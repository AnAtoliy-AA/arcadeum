import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { WeeklyLeagueService } from './weekly-league.service';

@Injectable()
export class WeeklyLeagueRolloverCron {
  private readonly logger = new Logger(WeeklyLeagueRolloverCron.name);

  constructor(private readonly leagueService: WeeklyLeagueService) {}

  /**
   * Runs every Sunday at 23:50 UTC (10 minutes before midnight) to finalize
   * the current week and set up leagues for the next week.
   */
  @Cron('50 23 * * 0')
  async run(): Promise<void> {
    try {
      const result = await this.leagueService.rolloverWeek();
      this.logger.log(
        `Weekly league rollover complete: ${result.leaguesProcessed} leagues, ` +
          `${result.playersPromoted} promoted, ${result.playersDemoted} demoted`,
      );
    } catch (err) {
      this.logger.error(`Weekly league rollover failed: ${String(err)}`);
    }
  }
}
