import type { Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket, Server } from 'socket.io';
import {
  maybeDecrypt,
  maybeEncrypt,
} from '../common/utils/socket-encryption.util';
import { extractString, validatePayloadUserId } from './games.gateway.utils';
import type {
  GameSessionSummary,
  GameSessionsService,
} from './sessions/game-sessions.service';
import type { GamesService } from './games.service';
import type { ChessBotService } from './engines/chess/chess-bot.service';
import type {
  BoardPosition,
  ChessMove,
  ChessPiece,
  ChessState,
} from '@arcadeum/games-core/games/chess/chess.types';
import type { PieceType } from '@arcadeum/games-core/games/chess/chess.constants';

export type HintRejectionReason =
  | 'ranked'
  | 'unsupported_game'
  | 'not_participant'
  | 'game_over'
  | 'not_your_turn'
  | 'no_legal_moves';

export interface HintMovePayload {
  from: BoardPosition;
  to: BoardPosition;
  piece: ChessPiece;
  captured: ChessPiece | null;
  promotion: PieceType | null;
  isCastle: boolean;
}

type HintResultPayload =
  | {
      ok: true;
      roomId: string;
      sessionId: string;
      move: HintMovePayload;
      ts: number;
    }
  | {
      ok: false;
      roomId: string;
      sessionId: string;
      reason: HintRejectionReason;
      ts: number;
    };

function serializeHintMove(move: ChessMove): HintMovePayload {
  return {
    from: move.from,
    to: move.to,
    piece: move.piece,
    captured: move.captured ?? null,
    promotion: move.promotion ?? null,
    isCastle: move.isCastle ?? false,
  };
}

function emitHintResult(client: Socket, payload: HintResultPayload): void {
  client.emit('games.session.hint_result', maybeEncrypt(payload));
}

function rejectHint(
  client: Socket,
  roomId: string,
  sessionId: string,
  reason: HintRejectionReason,
): void {
  emitHintResult(client, {
    ok: false,
    roomId,
    sessionId,
    reason,
    ts: Date.now(),
  });
}

/**
 * Coach Mode (ARC-926): computes a best-move hint for the requesting player
 * using the server-side chess bot at expert strength. Replies ONLY to the
 * requesting socket — never broadcast to the room.
 */
export async function handleRequestHint(
  logger: Logger,
  server: Server,
  client: Socket,
  realtime: { roomChannel(id: string): string },
  payload: unknown,
  sessionsService: GameSessionsService,
  gamesService: GamesService,
  chessBotService: ChessBotService,
): Promise<void> {
  const decrypted = maybeDecrypt<{
    roomId?: string;
    sessionId?: string;
    userId?: string;
  }>(payload);
  const roomId = extractString(decrypted, 'roomId');
  const sessionId = extractString(decrypted, 'sessionId');
  const userId = extractString(decrypted, 'userId');
  validatePayloadUserId(client, userId);

  const channel = realtime.roomChannel(roomId);
  if (!client.rooms.has(channel)) return;

  let session: GameSessionSummary;
  try {
    session = await sessionsService.getSession(sessionId);
  } catch (error) {
    logger.warn(`Hint request failed for session ${sessionId}: ${error}`);
    throw new WsException('Session not found.');
  }
  if (session.roomId !== roomId) {
    throw new WsException('Session does not belong to this room.');
  }

  const room = await gamesService.getRoom(session.roomId);
  if (room.gameOptions?.ranked === true) {
    rejectHint(client, roomId, sessionId, 'ranked');
    return;
  }
  if (!session.gameId.startsWith('chess')) {
    rejectHint(client, roomId, sessionId, 'unsupported_game');
    return;
  }

  const state = session.state as unknown as ChessState;
  const color = state.players.find((p) => p.playerId === userId)?.color;
  if (!color) {
    rejectHint(client, roomId, sessionId, 'not_participant');
    return;
  }
  if (session.status !== 'active') {
    rejectHint(client, roomId, sessionId, 'game_over');
    return;
  }
  if (state.currentTurnColor !== color) {
    rejectHint(client, roomId, sessionId, 'not_your_turn');
    return;
  }

  const hintState = { ...state, botDifficulty: 'expert' as const };
  const move = chessBotService.findBestMove(hintState);
  if (!move) {
    rejectHint(client, roomId, sessionId, 'no_legal_moves');
    return;
  }

  emitHintResult(client, {
    ok: true,
    roomId,
    sessionId,
    move: serializeHintMove(move),
    ts: Date.now(),
  });
}
