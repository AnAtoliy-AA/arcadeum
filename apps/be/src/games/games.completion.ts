import { Logger } from '@nestjs/common';
import { GameRoomsService } from './rooms/game-rooms.service';
import { GameSessionsService } from './sessions/game-sessions.service';
import type { GameSessionSummary } from './sessions/game-sessions.service';
import { GameSessionsArchiveService } from './sessions/game-sessions.archive.service';
import { GamesLeaderboardSyncService } from './games.leaderboard-sync.service';
import { GamePostMatchService } from './game-post-match.service';
import { GameReplayService } from './replays/game-replay.service';

export interface CompletionDeps {
  roomsService: GameRoomsService;
  sessionsService: GameSessionsService;
  leaderboardSync: GamesLeaderboardSyncService;
  postMatch: GamePostMatchService;
  archiveService: GameSessionsArchiveService;
  replayService: GameReplayService;
  logger: Logger;
}

/**
 * Post-match side effects for a completed session: mark the room completed,
 * clear the leaderboard "in match" flags, pay out coins, archive to Atlas,
 * create a replay, and run daily-challenge/achievement/stats processing.
 */
export async function finalizeCompletedSession(
  session: GameSessionSummary,
  players: string[],
  deps: CompletionDeps,
): Promise<void> {
  await deps.roomsService.updateRoomStatus(session.roomId, 'completed');
  await deps.leaderboardSync.syncInMatch(players, false);
  await deps.postMatch.payoutGameWin(session);
  await deps.archiveService.archiveSessionToAtlas(session);

  try {
    const room = await deps.roomsService.getRoomRaw(session.roomId);
    if (room) {
      await deps.replayService.createReplay(session, room);
    }
  } catch (err) {
    deps.logger.warn(
      `Replay creation failed for session ${session.id}: ${(err as Error).message}`,
    );
  }

  try {
    const winners = await deps.sessionsService.getWinners(session.id);
    await deps.postMatch.onGameCompleted(players, session.gameId, winners, {});
  } catch (err) {
    deps.logger.warn(
      `Post-match processing failed for session ${session.id}: ${(err as Error).message}`,
    );
  }
}
