import { Injectable, Logger } from '@nestjs/common';
import { LeaderboardsService } from '../leaderboards/leaderboards.service';

/**
 * Thin adapter that flips the leaderboard `isInMatch` flag for a set of users
 * when matches start/end. Failures are swallowed and logged so a leaderboard
 * outage cannot break game flow.
 */
@Injectable()
export class GamesLeaderboardSyncService {
  private readonly logger = new Logger(GamesLeaderboardSyncService.name);

  constructor(private readonly leaderboards: LeaderboardsService) {}

  async syncInMatch(
    userIds: string[] | undefined,
    isInMatch: boolean,
  ): Promise<void> {
    if (!userIds || userIds.length === 0) return;
    try {
      await this.leaderboards.markInMatch(userIds, isInMatch);
    } catch (err: unknown) {
      this.logger.warn(
        `Failed to sync in-match flag (${isInMatch}): ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
}
