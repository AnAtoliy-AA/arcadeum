import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { CheckersService } from './checkers.service';
import type { GameSessionSummary } from '../sessions/game-sessions.service';
import { GAME_PHASE, BOARD_SIZE } from '../engines/checkers/checkers.constants';
import type {
  CheckersState,
  MovePayload,
  MoveStep,
} from '../engines/checkers/checkers.types';
import {
  findCaptures,
  findAllCapturesForPlayer,
  getAvailableMovesForPlayer,
  getPlayerColor,
  applyMove,
  getOpponentId,
  isPlayerPiece,
} from '../engines/checkers/checkers.utils';

const MOVE_DELAY_MS = { min: 400, max: 1100 };

@Injectable()
export class CheckersBotService {
  private readonly logger = new Logger(CheckersBotService.name);
  private readonly processing = new Set<string>();

  constructor(
    @Inject(forwardRef(() => CheckersBotService))
    private readonly checkersService: CheckersService,
  ) {}

  isBot(userId: string): boolean {
    return userId.startsWith('bot-');
  }

  async checkAndPlay(session: GameSessionSummary): Promise<void> {
    if (session.status !== 'active') return;
    const state = session.state as unknown as CheckersState | undefined;
    if (!state || state.phase !== GAME_PHASE.PLAYING) return;

    const hasAliveHuman = state.players.some(
      (p) => p.alive && !this.isBot(p.playerId),
    );
    if (!hasAliveHuman) {
      this.logger.log(
        `No alive humans in room ${session.roomId} — completing session`,
      );
      await this.checkersService.completeSession(session.id, session.roomId);
      return;
    }

    const currentBotId = state.playerOrder[state.currentTurnIndex];
    if (!currentBotId || !this.isBot(currentBotId)) return;

    const lockKey = `${session.roomId}:${currentBotId}`;
    if (this.processing.has(lockKey)) return;
    this.processing.add(lockKey);

    try {
      await this.randomDelay(MOVE_DELAY_MS);
      const move = this.pickMove(state, currentBotId);
      if (!move) return;
      await this.checkersService.movePiece(currentBotId, session.roomId, move);
    } catch (error) {
      this.logger.error(`Bot ${currentBotId} failed to play: ${error}`);
    } finally {
      this.processing.delete(lockKey);
    }
  }

  pickMove(state: CheckersState, botId: string): MovePayload | null {
    const playerColor = getPlayerColor(state, botId);
    if (!playerColor) return null;

    const captures = findAllCapturesForPlayer(state.board, botId, playerColor);
    if (captures.length > 0) {
      return this.bestCaptureSequence(state, botId, playerColor);
    }

    const simpleMoves = getAvailableMovesForPlayer(
      state.board,
      botId,
      playerColor,
    );
    if (simpleMoves.length === 0) return null;

    // Minimax for simple moves
    return this.minimaxMove(state, botId, playerColor);
  }

  private bestCaptureSequence(
    state: CheckersState,
    botId: string,
    playerColor: string,
  ): MovePayload {
    // Try to find the longest capture sequence for each starting piece
    let bestSteps: MoveStep[] = [];

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (!isPlayerPiece(state.board[r][c], botId)) continue;
        const sequence = this.findLongestCapture(
          state.board,
          r,
          c,
          botId,
          playerColor,
        );
        if (sequence.length > bestSteps.length) {
          bestSteps = sequence;
        }
      }
    }

    return { steps: bestSteps };
  }

  private findLongestCapture(
    board: import('../engines/checkers/checkers.types').Board,
    row: number,
    col: number,
    playerId: string,
    playerColor: string,
  ): MoveStep[] {
    const captures = findCaptures(board, row, col, playerId, playerColor);
    if (captures.length === 0) return [];

    let bestSequence: MoveStep[] = [];

    for (const capture of captures) {
      const boardAfterCapture = applyMove(board, [capture]);
      const piece = boardAfterCapture[capture.toRow][capture.toCol];
      if (!piece) continue;

      const furtherCaptures = this.findLongestCapture(
        boardAfterCapture,
        capture.toRow,
        capture.toCol,
        playerId,
        playerColor,
      );

      const sequence = [capture, ...furtherCaptures];
      if (sequence.length > bestSequence.length) {
        bestSequence = sequence;
      }
    }

    return bestSequence;
  }

  private minimaxMove(
    state: CheckersState,
    botId: string,
    playerColor: string,
  ): MovePayload | null {
    const opponentId = getOpponentId(state, botId);
    if (!opponentId) return null;
    const opponentColor = getPlayerColor(state, opponentId);
    if (!opponentColor) return null;

    const simpleMoves = getAvailableMovesForPlayer(
      state.board,
      botId,
      playerColor,
    );
    if (simpleMoves.length === 0) return null;

    let bestScore = -Infinity;
    let bestSteps: MoveStep[] = [];

    for (const move of simpleMoves) {
      const probe = applyMove(state.board, [move]);
      const score = this.minimax(
        probe,
        botId,
        playerColor,
        opponentId,
        opponentColor,
        false,
        0,
        4,
      );
      if (score > bestScore) {
        bestScore = score;
        bestSteps = [move];
      }
    }

    return bestSteps.length > 0 ? { steps: bestSteps } : null;
  }

  private minimax(
    board: import('../engines/checkers/checkers.types').Board,
    currentPlayerId: string,
    currentColor: string,
    opponentId: string,
    opponentColor: string,
    isMaximizing: boolean,
    depth: number,
    maxDepth: number,
  ): number {
    if (depth >= maxDepth) {
      return this.evaluateBoard(board, currentPlayerId);
    }

    const activeId = isMaximizing ? currentPlayerId : opponentId;
    const activeColor = isMaximizing ? currentColor : opponentColor;

    const captures = findAllCapturesForPlayer(board, activeId, activeColor);
    if (captures.length > 0) {
      // Forced capture
      let best = isMaximizing ? -Infinity : Infinity;
      for (const capture of captures) {
        const newBoard = applyMove(board, [capture]);
        // Check for multi-jumps
        const piece = newBoard[capture.toRow][capture.toCol];
        if (piece) {
          const furtherCaptures = findCaptures(
            newBoard,
            capture.toRow,
            capture.toCol,
            activeId,
            activeColor,
          );
          if (furtherCaptures.length > 0) {
            // Continue the chain
            const chain = this.findLongestChain(
              newBoard,
              capture.toRow,
              capture.toCol,
              activeId,
              activeColor,
            );
            const finalBoard = applyMove(newBoard, chain);
            const score = this.minimax(
              finalBoard,
              currentPlayerId,
              currentColor,
              opponentId,
              opponentColor,
              !isMaximizing,
              depth + 1,
              maxDepth,
            );
            best = isMaximizing ? Math.max(best, score) : Math.min(best, score);
            continue;
          }
        }
        const score = this.minimax(
          newBoard,
          currentPlayerId,
          currentColor,
          opponentId,
          opponentColor,
          !isMaximizing,
          depth + 1,
          maxDepth,
        );
        best = isMaximizing ? Math.max(best, score) : Math.min(best, score);
      }
      return best;
    }

    const simpleMoves = getAvailableMovesForPlayer(
      board,
      activeId,
      activeColor,
    );
    if (simpleMoves.length === 0) {
      return isMaximizing ? -1000 + depth : 1000 - depth;
    }

    let best = isMaximizing ? -Infinity : Infinity;
    for (const move of simpleMoves) {
      const newBoard = applyMove(board, [move]);
      const score = this.minimax(
        newBoard,
        currentPlayerId,
        currentColor,
        opponentId,
        opponentColor,
        !isMaximizing,
        depth + 1,
        maxDepth,
      );
      best = isMaximizing ? Math.max(best, score) : Math.min(best, score);
    }
    return best;
  }

  private findLongestChain(
    board: import('../engines/checkers/checkers.types').Board,
    row: number,
    col: number,
    playerId: string,
    playerColor: string,
  ): MoveStep[] {
    const captures = findCaptures(board, row, col, playerId, playerColor);
    if (captures.length === 0) return [];

    let best: MoveStep[] = [];
    for (const cap of captures) {
      const newBoard = applyMove(board, [cap]);
      const chain = this.findLongestChain(
        newBoard,
        cap.toRow,
        cap.toCol,
        playerId,
        playerColor,
      );
      if (chain.length + 1 > best.length) {
        best = [cap, ...chain];
      }
    }
    return best;
  }

  private evaluateBoard(
    board: import('../engines/checkers/checkers.types').Board,
    botId: string,
  ): number {
    let score = 0;

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const piece = board[r][c];
        if (!piece) continue;

        const isBot = piece.playerId === botId;
        const sign = isBot ? 1 : -1;

        // Material value
        if (piece.type === 'king') {
          score += sign * 5;
        } else {
          score += sign * 1;
        }

        // Positional value: pieces closer to promotion or center
        if (piece.type === 'man') {
          if (piece.playerId === botId) {
            // Bot's pieces benefit from advancing (toward row 7)
            score += sign * (r / BOARD_SIZE) * 0.5;
          } else {
            // Opponent's pieces benefit from advancing (toward row 0)
            score += sign * ((BOARD_SIZE - 1 - r) / BOARD_SIZE) * 0.5;
          }
        }

        // Center control
        const centerDist = Math.abs(r - 3.5) + Math.abs(c - 3.5);
        score += sign * (7 - centerDist) * 0.05;
      }
    }

    return score;
  }

  private async randomDelay(range: { min: number; max: number }) {
    const ms = range.min + Math.random() * (range.max - range.min);
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
