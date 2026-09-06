import { Injectable, Logger } from '@nestjs/common';
import { DailyChallengesService } from '../daily-challenges/daily-challenges.service';
import { AchievementsService } from '../achievements/achievements.service';
import { WalletService } from '../wallet/wallet.service';
import { EconomySettingsService } from '../economy/economy-settings.service';
import type { GameSessionSummary } from './sessions/game-sessions.service';
import { GameSessionsService } from './sessions/game-sessions.service';
import { PlayerStatsService } from './player-stats.service';
import { BattlePassService } from '../battle-pass/battle-pass.service';
import { ChessProfilesService } from './chess/profiles/chess-profiles.service';

@Injectable()
export class GamePostMatchService {
  private readonly logger = new Logger(GamePostMatchService.name);

  constructor(
    private readonly dailyChallenges: DailyChallengesService,
    private readonly achievements: AchievementsService,
    private readonly sessionsService: GameSessionsService,
    private readonly wallet: WalletService,
    private readonly economy: EconomySettingsService,
    private readonly playerStats: PlayerStatsService,
    private readonly battlePass: BattlePassService,
    private readonly chessProfiles: ChessProfilesService,
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
      const humanPlayerIds = playerIds.filter((id) => !id.startsWith('bot-'));
      if (humanPlayerIds.length > 0) {
        const definitions = await this.achievements.getDefinitions();
        await Promise.allSettled(
          humanPlayerIds.map((playerId) =>
            this.achievements.checkAndUnlockWithDefinitions(
              playerId,
              definitions,
            ),
          ),
        );
      }
    } catch (err) {
      this.logger.warn(`Achievements check failed: ${(err as Error).message}`);
    }

    try {
      await this.playerStats.recordGameResult(playerIds, gameId, winners);
    } catch (err) {
      this.logger.warn(
        `Player stats recording failed: ${(err as Error).message}`,
      );
    }

    try {
      await this.battlePass.awardGameXp(playerIds, winners);
    } catch (err) {
      this.logger.warn(
        `Battle pass XP award failed: ${(err as Error).message}`,
      );
    }

    if (gameId === 'chess_v1') {
      try {
        await this.updateChessElo(playerIds, winners);
      } catch (err) {
        this.logger.warn(`Chess Elo update failed: ${(err as Error).message}`);
      }
    }
  }

  private async updateChessElo(
    playerIds: string[],
    winners: string[],
  ): Promise<void> {
    const humanPlayers = playerIds.filter((id) => !id.startsWith('bot-'));
    if (humanPlayers.length < 2) return;

    const profiles = await Promise.all(
      humanPlayers.map((id) => this.chessProfiles.getOrCreateProfile(id)),
    );

    const whiteId = humanPlayers[0];
    const blackId = humanPlayers[1];
    const whiteProfile = profiles[0];
    const blackProfile = profiles[1];

    const whiteStats = whiteProfile.perGameStats['chess_v1'] ?? { elo: 1200, games: 0 };
    const blackStats = blackProfile.perGameStats['chess_v1'] ?? { elo: 1200, games: 0 };

    const isDraw = winners.length === 0;
    const whiteWon = winners.includes(whiteId);

    const { winnerChange, loserChange } = this.chessProfiles.calculateEloChange(
      whiteStats.elo,
      blackStats.elo,
      isDraw,
      whiteStats.games,
    );

    if (isDraw) {
      await this.chessProfiles.recordGameResult(whiteId, 'chess_v1', 'draw', winnerChange);
      await this.chessProfiles.recordGameResult(blackId, 'chess_v1', 'draw', loserChange);
    } else if (whiteWon) {
      await this.chessProfiles.recordGameResult(whiteId, 'chess_v1', 'won', winnerChange);
      await this.chessProfiles.recordGameResult(blackId, 'chess_v1', 'lost', loserChange);
    } else {
      await this.chessProfiles.recordGameResult(whiteId, 'chess_v1', 'lost', loserChange);
      await this.chessProfiles.recordGameResult(blackId, 'chess_v1', 'won', winnerChange);
    }
  }

  async payoutGameWin(
    session: GameSessionSummary,
    playerIds: string[] = [],
  ): Promise<void> {
    try {
      const sessionId = session.id;
      const winners = await this.sessionsService.getWinners(sessionId);
      // Bots never receive rewards, and solo-vs-bot matches pay nothing —
      // otherwise grinding an easy bot is an unbounded coin faucet. PvP
      // (2+ humans) pays as before.
      const humanPlayers = playerIds.filter((id) => !id.startsWith('bot-'));
      const payableWinners =
        humanPlayers.length >= 2
          ? winners.filter((id) => !id.startsWith('bot-'))
          : [];
      if (payableWinners.length === 0) return;
      const reward = await this.economy.getNumber('game_win_coin_reward');
      if (reward <= 0) return;
      await Promise.allSettled(
        payableWinners.map((winnerId) =>
          this.wallet
            .credit(
              winnerId,
              'coins',
              reward,
              'game_win',
              `game-${sessionId}-payout-${winnerId}`,
              { sessionId, gameId: session.gameId },
            )
            .catch((err) => {
              this.logger.warn(
                `Game-win payout failed for session ${sessionId} winner ${winnerId}: ${(err as Error).message}`,
              );
            }),
        ),
      );
    } catch (err) {
      this.logger.warn(
        `Failed to determine winners for session ${session.id}: ${(err as Error).message}`,
      );
    }
  }
}
