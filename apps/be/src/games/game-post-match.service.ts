import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { DailyChallengesService } from '../daily-challenges/daily-challenges.service';
import { AchievementsService } from '../achievements/achievements.service';
import { WalletService } from '../wallet/wallet.service';
import { EconomySettingsService } from '../economy/economy-settings.service';
import type { GameSessionSummary } from './sessions/game-sessions.service';
import { GameSessionsService } from './sessions/game-sessions.service';
import { PlayerStatsService } from './player-stats.service';
import { ChessProfilesService } from './chess/profiles/chess-profiles.service';
import { XpSettingsService } from '../xp/xp-settings.service';
import { ActivityFeedService } from './activity-feed/activity-feed.service';
import { ClanWarsQueueService } from '../clans/clan-wars-queue.service';
import { ArcadePetTreatRewardService } from '../arcade-pet/arcade-pet-treat-reward.service';
import { GameRoomsService } from './rooms/game-rooms.service';
import { GamesLeaderboardSyncService } from './games.leaderboard-sync.service';
import { GameSessionsArchiveService } from './sessions/game-sessions.archive.service';
import { RankingService } from '../ranking/ranking.service';
import { recordRankedResultForSession } from './games.ranked-result';
import { GameReplayService } from './replays/game-replay.service';
import { ClanWarsAutomationService } from '../clans/clan-wars-automation.service';

@Injectable()
export class GamePostMatchService implements OnModuleInit {
  private readonly logger = new Logger(GamePostMatchService.name);

  constructor(
    private readonly dailyChallenges: DailyChallengesService,
    private readonly achievements: AchievementsService,
    private readonly sessionsService: GameSessionsService,
    private readonly wallet: WalletService,
    private readonly economy: EconomySettingsService,
    private readonly playerStats: PlayerStatsService,
    private readonly chessProfiles: ChessProfilesService,
    private readonly xpSettings: XpSettingsService,
    private readonly activityFeed: ActivityFeedService,
    private readonly roomsService: GameRoomsService,
    private readonly leaderboardSync: GamesLeaderboardSyncService,
    private readonly archiveService: GameSessionsArchiveService,
    private readonly replayService: GameReplayService,
    private readonly rankingService: RankingService,
    @Optional()
    private readonly clanWarsQueue?: ClanWarsQueueService,
    @Optional()
    private readonly clanWarsAutomation?: ClanWarsAutomationService,
    @Optional()
    private readonly petTreats?: ArcadePetTreatRewardService,
  ) {}

  onModuleInit(): void {
    this.sessionsService.onSessionCompleted((session) =>
      this.processCompletedSession(session),
    );
  }

  /**
   * Single entry point for a finished live game. Runs once per session
   * (atomic claim on the session document) so retries, reconnects and
   * duplicate completion signals never double-award.
   */
  async processCompletedSession(session: GameSessionSummary): Promise<void> {
    const claimed = await this.sessionsService.claimPostMatchProcessing(
      session.id,
    );
    if (!claimed) {
      this.logger.debug(
        `Post-match already processed for session ${session.id}`,
      );
      return;
    }

    const players = await this.roomsService.getRoomParticipants(session.roomId);

    // An aborted game (e.g. chess before both sides moved) has no result:
    // no rating change, no rewards, no stats. Only close and archive it.
    if (isAbortedSession(session)) {
      try {
        await this.roomsService.updateRoomStatus(session.roomId, 'completed');
        await this.leaderboardSync.syncInMatch(players, false);
      } catch (err) {
        this.logger.warn(
          `Room/leaderboard sync failed for aborted session ${session.id}: ${(err as Error).message}`,
        );
      }
      await this.archiveService.archiveSessionToAtlas(session);
      return;
    }

    // Ranked ELO (no-op for unranked rooms; failures are logged inside).
    await recordRankedResultForSession(
      session,
      this.roomsService,
      this.sessionsService,
      this.rankingService,
      this.logger,
    );

    try {
      await this.roomsService.updateRoomStatus(session.roomId, 'completed');
      await this.leaderboardSync.syncInMatch(players, false);
    } catch (err) {
      this.logger.warn(
        `Room/leaderboard sync failed for session ${session.id}: ${(err as Error).message}`,
      );
    }

    await this.payoutGameWin(session, players);
    await this.archiveService.archiveSessionToAtlas(session);

    try {
      const room = await this.roomsService.getRoomRaw(session.roomId);
      if (room) await this.replayService.createReplay(session, room);
    } catch (err) {
      this.logger.warn(
        `Replay creation failed for session ${session.id}: ${(err as Error).message}`,
      );
    }

    const winners = await this.sessionsService.getWinners(session.id);
    await this.onGameCompleted(
      players,
      session.gameId,
      winners,
      {},
      session.id,
    );
  }

  async onGameCompleted(
    playerIds: string[],
    gameId: string,
    winners: string[],
    stats: { shots?: number; shipsSunk?: number },
    sessionId?: string,
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
      const hasBots = playerIds.some((id) => id.startsWith('bot-'));
      await this.playerStats.recordGameResult(
        playerIds,
        gameId,
        winners,
        hasBots,
        sessionId,
      );
    } catch (err) {
      this.logger.warn(
        `Player stats recording failed: ${(err as Error).message}`,
      );
    }

    try {
      await this.petTreats?.awardWinTreats(gameId, winners, sessionId);
    } catch (err) {
      this.logger.warn(`Pet treat award failed: ${(err as Error).message}`);
    }

    if (gameId === 'chess_v1') {
      try {
        await this.updateChessElo(playerIds, winners);
      } catch (err) {
        this.logger.warn(`Chess Elo update failed: ${(err as Error).message}`);
      }
    }

    try {
      await this.awardMultiplayerXp(playerIds, winners, gameId);
    } catch (err) {
      this.logger.warn(
        `Multiplayer XP award failed: ${(err as Error).message}`,
      );
    }

    try {
      const humanPlayerIds = playerIds.filter((id) => !id.startsWith('bot-'));
      const isDraw = winners.length === 0;
      const detail = isDraw
        ? 'played a draw'
        : winners.length === 1
          ? 'won a game'
          : 'won a team game';
      for (const playerId of humanPlayerIds) {
        await this.activityFeed.recordEvent({
          type: 'game_completed',
          userId: playerId,
          gameId,
          detail,
        });
      }
    } catch (err) {
      this.logger.warn(
        `Activity feed recording failed: ${(err as Error).message}`,
      );
    }

    try {
      const winnerId = winners[0];
      const opponentId = playerIds.find((id) => id !== winnerId);
      if (
        winners.length === 1 &&
        winnerId &&
        opponentId &&
        !winnerId.startsWith('bot-') &&
        !opponentId.startsWith('bot-')
      ) {
        let dispatched = false;
        if (this.clanWarsQueue) {
          dispatched = await this.clanWarsQueue.dispatchMatchResolution(
            winnerId,
            opponentId,
            gameId,
          );
        }
        if (!dispatched && this.clanWarsAutomation) {
          await this.clanWarsAutomation.resolveMatchForPlayers(
            winnerId,
            opponentId,
            gameId,
          );
        }
      }
    } catch (err) {
      this.logger.warn(`Clan war resolution failed: ${(err as Error).message}`);
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

    const whiteStats = whiteProfile.perGameStats['chess_v1'] ?? {
      elo: 1200,
      games: 0,
    };
    const blackStats = blackProfile.perGameStats['chess_v1'] ?? {
      elo: 1200,
      games: 0,
    };

    const isDraw = winners.length === 0;
    const whiteWon = winners.includes(whiteId);

    const { winnerChange, loserChange } = this.chessProfiles.calculateEloChange(
      whiteStats.elo,
      blackStats.elo,
      isDraw,
      whiteStats.games,
    );

    if (isDraw) {
      await this.chessProfiles.recordGameResult(
        whiteId,
        'chess_v1',
        'draw',
        winnerChange,
      );
      await this.chessProfiles.recordGameResult(
        blackId,
        'chess_v1',
        'draw',
        loserChange,
      );
    } else if (whiteWon) {
      await this.chessProfiles.recordGameResult(
        whiteId,
        'chess_v1',
        'won',
        winnerChange,
      );
      await this.chessProfiles.recordGameResult(
        blackId,
        'chess_v1',
        'lost',
        loserChange,
      );
    } else {
      await this.chessProfiles.recordGameResult(
        whiteId,
        'chess_v1',
        'lost',
        loserChange,
      );
      await this.chessProfiles.recordGameResult(
        blackId,
        'chess_v1',
        'won',
        winnerChange,
      );
    }
  }

  private async awardMultiplayerXp(
    playerIds: string[],
    winners: string[],
    gameId: string,
  ): Promise<void> {
    const humanIds = playerIds.filter((id) => !id.startsWith('bot-'));
    if (humanIds.length === 0) return;

    const hasBots = playerIds.some((id) => id.startsWith('bot-'));

    for (const userId of humanIds) {
      try {
        const isWinner = winners.includes(userId);
        const isDraw = winners.length === 0;
        const result: 'won' | 'lost' | 'draw' = isWinner
          ? 'won'
          : isDraw
            ? 'draw'
            : 'lost';

        const amount = await this.xpSettings.getXpReward(
          gameId,
          result,
          false,
          hasBots,
        );
        if (amount > 0) {
          await this.xpSettings.awardXp(userId, amount);
        }
      } catch (err) {
        this.logger.error(
          `XP award failed for user ${userId} (${gameId}): ${(err as Error).message}`,
        );
      }
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

/** True when the engine marked the finished game as aborted. */
export function isAbortedSession(session: GameSessionSummary): boolean {
  const result = session.state?.gameResult as { aborted?: unknown } | undefined;
  return result?.aborted === true;
}
