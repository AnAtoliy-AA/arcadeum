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
import type { CheckersBotService } from './checkers/checkers-bot.service';
import type { BackgammonBotService } from './backgammon/backgammon-bot.service';
import type {
  BoardPosition,
  ChessMove,
  ChessPiece,
  ChessState,
} from '@arcadeum/games-core/games/chess/chess.types';
import type { PieceType } from '@arcadeum/games-core/games/chess/chess.constants';
import type {
  CheckersState,
  MovePayload,
  MoveStep,
} from '@arcadeum/games-core/games/checkers/checkers.types';
import type {
  BackgammonState,
  MoveCheckerPayload,
} from '@arcadeum/games-core/games/backgammon/backgammon.types';

export type HintRejectionReason =
  | 'ranked'
  | 'unsupported_game'
  | 'not_participant'
  | 'game_over'
  | 'not_your_turn'
  | 'no_legal_moves';

export interface ChessHintMovePayload {
  gameType?: 'chess';
  from: BoardPosition;
  to: BoardPosition;
  piece: ChessPiece;
  captured: ChessPiece | null;
  promotion: PieceType | null;
  isCastle: boolean;
}

export interface CheckersHintMovePayload {
  gameType: 'checkers';
  from: { row: number; col: number };
  to: { row: number; col: number };
  steps: MoveStep[];
}

export interface BackgammonHintMovePayload {
  gameType: 'backgammon';
  from: number | 'bar';
  to: number | 'off';
}

export type HintMovePayload =
  ChessHintMovePayload | CheckersHintMovePayload | BackgammonHintMovePayload;

export interface HintBotServices {
  chess?: ChessBotService;
  checkers?: CheckersBotService;
  backgammon?: BackgammonBotService;
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

function serializeHintMove(move: ChessMove): ChessHintMovePayload {
  return {
    from: move.from,
    to: move.to,
    piece: move.piece,
    captured: move.captured ?? null,
    promotion: move.promotion ?? null,
    isCastle: move.isCastle ?? false,
  };
}

function serializeCheckersHintMove(move: MovePayload): CheckersHintMovePayload {
  const first = move.steps[0];
  const last = move.steps[move.steps.length - 1];
  return {
    gameType: 'checkers',
    from: { row: first.fromRow, col: first.fromCol },
    to: { row: last.toRow, col: last.toCol },
    steps: move.steps,
  };
}

function serializeBackgammonHintMove(
  move: MoveCheckerPayload,
): BackgammonHintMovePayload {
  return {
    gameType: 'backgammon',
    from: move.from,
    to: move.to,
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

export async function handleRequestHint(
  logger: Logger,
  server: Server,
  client: Socket,
  realtime: { roomChannel(id: string): string },
  payload: unknown,
  sessionsService: GameSessionsService,
  gamesService: GamesService,
  botsOrChess?: HintBotServices | ChessBotService,
  extraCheckersBot?: CheckersBotService,
  extraBackgammonBot?: BackgammonBotService,
): Promise<void> {
  const chessBot =
    botsOrChess && 'findBestMove' in botsOrChess
      ? botsOrChess
      : botsOrChess?.chess;
  const checkersBot =
    botsOrChess && 'findBestMove' in botsOrChess
      ? extraCheckersBot
      : (botsOrChess?.checkers ?? extraCheckersBot);
  const backgammonBot =
    botsOrChess && 'findBestMove' in botsOrChess
      ? extraBackgammonBot
      : (botsOrChess?.backgammon ?? extraBackgammonBot);

  const decrypted = maybeDecrypt<Record<string, unknown>>(payload);
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

  if (session.gameId.startsWith('chess')) {
    if (!chessBot) {
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
    const move = chessBot.findBestMove(hintState);
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
    return;
  }

  if (session.gameId.startsWith('checkers')) {
    if (!checkersBot) {
      rejectHint(client, roomId, sessionId, 'unsupported_game');
      return;
    }
    const state = session.state as unknown as CheckersState;
    const player = state.players?.find((p) => p.playerId === userId);
    if (!player) {
      rejectHint(client, roomId, sessionId, 'not_participant');
      return;
    }
    if (session.status !== 'active' || state.phase !== 'playing') {
      rejectHint(client, roomId, sessionId, 'game_over');
      return;
    }
    const currentTurnPlayerId = state.playerOrder?.[state.currentTurnIndex];
    if (currentTurnPlayerId !== userId) {
      rejectHint(client, roomId, sessionId, 'not_your_turn');
      return;
    }
    const mode: 'american' | 'international' | 'russian' =
      state.options?.mode === 'international' ||
      state.options?.mode === 'russian'
        ? state.options.mode
        : 'american';
    const hintState: CheckersState = {
      ...state,
      options: { ...state.options, mode, botDifficulty: 'expert' as const },
    };
    const move = checkersBot.pickMove(hintState, userId);
    if (!move || !move.steps || move.steps.length === 0) {
      rejectHint(client, roomId, sessionId, 'no_legal_moves');
      return;
    }
    emitHintResult(client, {
      ok: true,
      roomId,
      sessionId,
      move: serializeCheckersHintMove(move),
      ts: Date.now(),
    });
    return;
  }

  if (session.gameId.startsWith('backgammon')) {
    if (!backgammonBot) {
      rejectHint(client, roomId, sessionId, 'unsupported_game');
      return;
    }
    const state = session.state as unknown as BackgammonState;
    const player = state.players?.find((p) => p.playerId === userId);
    if (!player) {
      rejectHint(client, roomId, sessionId, 'not_participant');
      return;
    }
    if (session.status !== 'active' || state.phase === 'game_over') {
      rejectHint(client, roomId, sessionId, 'game_over');
      return;
    }
    const currentTurnPlayerId = state.playerOrder?.[state.currentTurnIndex];
    if (currentTurnPlayerId !== userId) {
      rejectHint(client, roomId, sessionId, 'not_your_turn');
      return;
    }
    if (state.phase !== 'move' || !state.dice || state.dice.length === 0) {
      rejectHint(client, roomId, sessionId, 'no_legal_moves');
      return;
    }
    const hintState = {
      ...state,
      options: { ...state.options, aiDifficulty: 'expert' as const },
    };
    const move = backgammonBot.pickMove(hintState, userId);
    if (!move) {
      rejectHint(client, roomId, sessionId, 'no_legal_moves');
      return;
    }
    emitHintResult(client, {
      ok: true,
      roomId,
      sessionId,
      move: serializeBackgammonHintMove(move),
      ts: Date.now(),
    });
    return;
  }

  rejectHint(client, roomId, sessionId, 'unsupported_game');
}
