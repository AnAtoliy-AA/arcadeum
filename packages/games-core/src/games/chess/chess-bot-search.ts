/**
 * Stateless entry point for one bot search. Each call uses a fresh ChessBot
 * so concurrent games never share transposition tables or personality, and
 * the function can run inside a worker thread (inputs/outputs are plain
 * structured-clone friendly data).
 */
import type { AiDifficulty } from '../../lib/ai-difficulty';
import type { PieceType } from './chess.constants';
import type { BoardPosition, ChessState } from './chess.types';
import { ChessBot } from './chess-bot';
import { getBotPersonality } from './chess-bot-personalities';

export interface BotSearchRequest {
  state: ChessState;
  timeBudgetMs: number;
  difficulty?: AiDifficulty;
  personalityId?: string | null;
}

export interface BotSearchMove {
  from: BoardPosition;
  to: BoardPosition;
  promotion: PieceType | null;
}

export function searchBotMove(req: BotSearchRequest): BotSearchMove | null {
  const bot = new ChessBot();
  if (req.difficulty) bot.setDifficulty(req.difficulty);
  bot.setPersonality(
    req.personalityId ? (getBotPersonality(req.personalityId) ?? null) : null,
  );
  const move = bot.findBestMove(req.state, Math.max(50, req.timeBudgetMs));
  if (!move) return null;
  return { from: move.from, to: move.to, promotion: move.promotion ?? null };
}
