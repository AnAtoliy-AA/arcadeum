import { Logger } from '@nestjs/common';
import { GameRoomsService } from './rooms/game-rooms.service';
import { GameSessionsService } from './sessions/game-sessions.service';
import type { GameSessionSummary } from './sessions/game-sessions.service';
import { RankingService } from '../ranking/ranking.service';

/**
 * For a completed ranked room, computes ELO for the human players and
 * attaches the per-user rating change to `session.state.gameResult`.
 * Returns the participant ids so the caller can reuse them, or `null`
 * when the match was not ranked-eligible.
 */
export async function recordRankedResultForSession(
  session: GameSessionSummary,
  roomsService: GameRoomsService,
  sessionsService: GameSessionsService,
  rankingService: RankingService,
  logger: Logger,
): Promise<string[] | null> {
  try {
    const room = await roomsService.getRoom(session.roomId);
    if (room.gameOptions?.ranked !== true) return null;
    const players = await roomsService.getRoomParticipants(session.roomId);
    const winners = await sessionsService.getWinners(session.id);
    const ratings = await rankingService.recordRankedResult(
      players,
      session.gameId,
      winners,
    );
    const gameResult = session.state?.gameResult;
    if (gameResult && typeof gameResult === 'object') {
      (gameResult as Record<string, unknown>).ratingDeltas = ratings;
    }
    return players;
  } catch (err) {
    logger.warn(
      `Ranked result recording failed for session ${session.id}: ${(err as Error).message}`,
    );
    return null;
  }
}
