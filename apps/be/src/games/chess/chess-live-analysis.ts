import type { Logger } from '@nestjs/common';
import { toFen } from '@arcadeum/games-core/games/chess/chess-fen';
import { isChessGameOver } from '@arcadeum/games-core/games/chess/chess-engine-rules';
import type { ChessState } from '../engines/chess/chess.types';
import type { GamesRealtimeService } from '../games.realtime.service';
import type { ChessStockfishService } from './engine/chess-stockfish.service';

export const CHESS_ANALYZED_EVENT = 'chess.session.analyzed';

/**
 * Runs a Stockfish evaluation of the current position and broadcasts it
 * (fire-and-forget). Fair play: seated players only receive engine output
 * once the game is over; spectators always receive it.
 */
export function broadcastLiveAnalysis(
  roomId: string,
  state: ChessState,
  stockfish: ChessStockfishService | null | undefined,
  realtime: GamesRealtimeService,
  logger: Logger,
): void {
  if (!stockfish?.isReady()) {
    logger.warn(
      `[Chess] Stockfish not ready, skipping analysis for room ${roomId}`,
    );
    return;
  }
  const fullFen = toFen(state);
  const gameOver = isChessGameOver(state);
  stockfish
    .analyzePositionMultiPV(fullFen, 12, 1500, 3)
    .then((result) => {
      const payload = {
        roomId,
        eval: {
          cp: result.cp,
          mate: result.mate,
          pv: result.pv,
          depth: result.depth,
          selDepth: result.selDepth,
          nodes: result.nodes,
          nps: result.nps,
          timeMs: result.timeMs,
        },
        alternatives: result.alternatives,
      };
      if (gameOver) realtime.emitToRoom(roomId, CHESS_ANALYZED_EVENT, payload);
      realtime.emitToSpectators(roomId, CHESS_ANALYZED_EVENT, payload);
    })
    .catch((err: unknown) => {
      logger.error(
        `[Chess] Stockfish analysis failed for room ${roomId}: ${String(err)}`,
      );
    });
}
