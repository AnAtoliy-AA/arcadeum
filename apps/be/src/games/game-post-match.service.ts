import { Injectable, Logger } from '@nestjs/common';
import { DailyChallengesService } from '../daily-challenges/daily-challenges.service';
import { AchievementsService } from '../achievements/achievements.service';
import { WalletService } from '../wallet/wallet.service';
import { EconomySettingsService } from '../economy/economy-settings.service';
import type { GameSessionSummary } from './sessions/game-sessions.service';
import { GameSessionsService } from './sessions/game-sessions.service';

@Injectable()
export class GamePostMatchService {
  private readonly logger = new Logger(GamePostMatchService.name);

  constructor(
    private readonly dailyChallenges: DailyChallengesService,
    private readonly achievements: AchievementsService,
    private readonly sessionsService: GameSessionsService,
    private readonly wallet: WalletService,
    private readonly economy: EconomySettingsService,
  ) {}

  async onGameCompleted(
    playerIds: string[],
    gameId: string,
    winners: string[],
    stats: { shots?: number; shipsSunk?: number },
  ): Promise<void> {
    try {
      await this.dailyChallenges.onGameCompleted(
        playerIds,
        gameId,
        winners,
        stats,
      );
    } catch (err) {
      this.logger.warn(
        `Daily challenges tracking failed: ${(err as Error).message}`,
      );
    }

    try {
      for (const playerId of playerIds) {
        if (!playerId.startsWith('bot-')) {
          await this.achievements.checkAndUnlock(playerId);
        }
      }
    } catch (err) {
      this.logger.warn(`Achievements check failed: ${(err as Error).message}`);
    }
  }

  async payoutGameWin(session: GameSessionSummary): Promise<void> {
    try {
      const sessionId = session.id;
      const winners = await this.sessionsService.getWinners(sessionId);
      if (winners.length === 0) return;
      const reward = await this.economy.getNumber('game_win_coin_reward');
      if (reward <= 0) return;
      for (const winnerId of winners) {
        try {
          await this.wallet.credit(
            winnerId,
            'coins',
            reward,
            'game_win',
            `game-${sessionId}-payout-${winnerId}`,
            { sessionId, gameId: session.gameId },
          );
        } catch (err) {
          this.logger.warn(
            `Game-win payout failed for session ${sessionId} winner ${winnerId}: ${(err as Error).message}`,
          );
        }
      }
    } catch (err) {
      this.logger.warn(
        `Failed to determine winners for session ${session.id}: ${(err as Error).message}`,
      );
    }
  }
}
