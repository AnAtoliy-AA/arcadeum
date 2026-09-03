import type {
  Board,
  CheckersState,
  MovePayload,
  MoveStep,
} from './checkers.types';
import { MODE_CONFIGS } from './checkers.constants';
import {
  findCaptures,
  findAllCapturesForPlayer,
  getAvailableMovesForPlayer,
  getPlayerColor,
  applyMove,
  getOpponentId,
  isPlayerPiece,
} from './checkers.utils';
import type { AiDifficulty } from '../../lib/ai-difficulty';

const DIFFICULTY_CONFIG: Record<
  AiDifficulty,
  { maxDepth: number; noiseRate: number }
> = {
  easy: { maxDepth: 1, noiseRate: 0.4 },
  medium: { maxDepth: 3, noiseRate: 0.1 },
  hard: { maxDepth: 5, noiseRate: 0.0 },
  expert: { maxDepth: 7, noiseRate: 0.0 },
};

/**
 * Framework-agnostic Checkers bot decision logic.
 *
 * Difficulty maps to minimax depth plus a noise rate at which the bot plays
 * a uniformly random legal move instead of searching:
 * - easy → depth 1, 40% noise
 * - medium → depth 3, 10% noise
 * - hard → depth 5
 * - expert → depth 7
 */
export class CheckersBot {
  pickMove(state: CheckersState, botId: string): MovePayload | null {
    const playerColor = getPlayerColor(state, botId);
    if (!playerColor) return null;

    const ruleConfig = MODE_CONFIGS[state.options.mode];
    const backwardCaptures =
      state.options.backwardCaptures || ruleConfig.backwardCapturesForMen;
    const flyingKings = ruleConfig.flyingKings;

    const captures = findAllCapturesForPlayer(
      state.board,
      botId,
      playerColor,
      backwardCaptures,
      flyingKings,
    );
    if (captures.length > 0) {
      return this.bestCaptureSequence(
        state,
        botId,
        playerColor,
        backwardCaptures,
        flyingKings,
      );
    }

    const simpleMoves = getAvailableMovesForPlayer(
      state.board,
      botId,
      playerColor,
      backwardCaptures,
      flyingKings,
    );
    if (simpleMoves.length === 0) return null;

    return this.minimaxMove(
      state,
      botId,
      playerColor,
      backwardCaptures,
      flyingKings,
    );
  }

  private bestCaptureSequence(
    state: CheckersState,
    botId: string,
    playerColor: string,
    backwardCaptures: boolean,
    flyingKings: boolean,
  ): MovePayload {
    let bestSteps: MoveStep[] = [];
    const size = state.board.length;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!isPlayerPiece(state.board[r][c], botId)) continue;
        const sequence = this.findLongestCapture(
          state.board,
          r,
          c,
          botId,
          playerColor,
          backwardCaptures,
          flyingKings,
        );
        if (sequence.length > bestSteps.length) {
          bestSteps = sequence;
        }
      }
    }

    return { steps: bestSteps };
  }

  private findLongestCapture(
    board: Board,
    row: number,
    col: number,
    playerId: string,
    playerColor: string,
    backwardCaptures: boolean,
    flyingKings: boolean,
  ): MoveStep[] {
    const captures = findCaptures(
      board,
      row,
      col,
      playerId,
      playerColor,
      backwardCaptures,
      flyingKings,
    );
    if (captures.length === 0) return [];

    let bestSequence: MoveStep[] = [];

    for (const capture of captures) {
      const boardAfterCapture = applyMove(board, [capture], playerColor);
      const piece = boardAfterCapture[capture.toRow][capture.toCol];
      if (!piece) continue;

      const furtherCaptures = this.findLongestCapture(
        boardAfterCapture,
        capture.toRow,
        capture.toCol,
        playerId,
        playerColor,
        backwardCaptures,
        flyingKings,
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
    backwardCaptures: boolean,
    flyingKings: boolean,
  ): MovePayload | null {
    const opponentId = getOpponentId(state, botId);
    if (!opponentId) return null;
    const opponentColor = getPlayerColor(state, opponentId);
    if (!opponentColor) return null;

    const simpleMoves = getAvailableMovesForPlayer(
      state.board,
      botId,
      playerColor,
      backwardCaptures,
      flyingKings,
    );
    if (simpleMoves.length === 0) return null;

    const difficulty = state.options.botDifficulty ?? 'medium';
    const config = DIFFICULTY_CONFIG[difficulty] ?? DIFFICULTY_CONFIG.medium;

    if (Math.random() < config.noiseRate) {
      const randomMove =
        simpleMoves[Math.floor(Math.random() * simpleMoves.length)];
      return { steps: [randomMove] };
    }

    let bestScore = -Infinity;
    let bestMoves: MoveStep[][] = [];

    for (const move of simpleMoves) {
      const probe = applyMove(state.board, [move], playerColor);
      const score = this.minimax(
        probe,
        botId,
        playerColor,
        opponentId,
        opponentColor,
        false,
        0,
        config.maxDepth,
        backwardCaptures,
        flyingKings,
      );
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [[move]];
      } else if (score === bestScore) {
        bestMoves.push([move]);
      }
    }

    if (bestMoves.length === 0) return null;
    const chosenSteps = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    return { steps: chosenSteps };
  }

  private minimax(
    board: Board,
    currentPlayerId: string,
    currentColor: string,
    opponentId: string,
    opponentColor: string,
    isMaximizing: boolean,
    depth: number,
    maxDepth: number,
    backwardCaptures: boolean,
    flyingKings: boolean,
  ): number {
    if (depth >= maxDepth) {
      return this.evaluateBoard(board, currentPlayerId);
    }

    const activeId = isMaximizing ? currentPlayerId : opponentId;
    const activeColor = isMaximizing ? currentColor : opponentColor;

    const captures = findAllCapturesForPlayer(
      board,
      activeId,
      activeColor,
      backwardCaptures,
      flyingKings,
    );
    if (captures.length > 0) {
      let best = isMaximizing ? -Infinity : Infinity;
      for (const capture of captures) {
        const newBoard = applyMove(board, [capture], activeColor);
        const piece = newBoard[capture.toRow][capture.toCol];
        if (piece) {
          const furtherCaptures = findCaptures(
            newBoard,
            capture.toRow,
            capture.toCol,
            activeId,
            activeColor,
            backwardCaptures,
            flyingKings,
          );
          if (furtherCaptures.length > 0) {
            const chain = this.findLongestChain(
              newBoard,
              capture.toRow,
              capture.toCol,
              activeId,
              activeColor,
              backwardCaptures,
              flyingKings,
            );
            const finalBoard = applyMove(newBoard, chain, activeColor);
            const score = this.minimax(
              finalBoard,
              currentPlayerId,
              currentColor,
              opponentId,
              opponentColor,
              !isMaximizing,
              depth + 1,
              maxDepth,
              backwardCaptures,
              flyingKings,
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
          backwardCaptures,
          flyingKings,
        );
        best = isMaximizing ? Math.max(best, score) : Math.min(best, score);
      }
      return best;
    }

    const simpleMoves = getAvailableMovesForPlayer(
      board,
      activeId,
      activeColor,
      backwardCaptures,
      flyingKings,
    );
    if (simpleMoves.length === 0) {
      return isMaximizing ? -1000 + depth : 1000 - depth;
    }

    let best = isMaximizing ? -Infinity : Infinity;
    for (const move of simpleMoves) {
      const newBoard = applyMove(board, [move], activeColor);
      const score = this.minimax(
        newBoard,
        currentPlayerId,
        currentColor,
        opponentId,
        opponentColor,
        !isMaximizing,
        depth + 1,
        maxDepth,
        backwardCaptures,
        flyingKings,
      );
      best = isMaximizing ? Math.max(best, score) : Math.min(best, score);
    }
    return best;
  }

  private findLongestChain(
    board: Board,
    row: number,
    col: number,
    playerId: string,
    playerColor: string,
    backwardCaptures: boolean,
    flyingKings: boolean,
  ): MoveStep[] {
    const captures = findCaptures(
      board,
      row,
      col,
      playerId,
      playerColor,
      backwardCaptures,
      flyingKings,
    );
    if (captures.length === 0) return [];

    let best: MoveStep[] = [];
    for (const cap of captures) {
      const newBoard = applyMove(board, [cap], playerColor);
      const chain = this.findLongestChain(
        newBoard,
        cap.toRow,
        cap.toCol,
        playerId,
        playerColor,
        backwardCaptures,
        flyingKings,
      );
      if (chain.length + 1 > best.length) {
        best = [cap, ...chain];
      }
    }
    return best;
  }

  private evaluateBoard(board: Board, botId: string): number {
    let score = 0;
    const size = board.length;
    const center = (size - 1) / 2;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const piece = board[r][c];
        if (!piece) continue;

        const isBot = piece.playerId === botId;
        const sign = isBot ? 1 : -1;

        if (piece.type === 'king') {
          score += sign * 5;
        } else {
          score += sign * 1;
        }

        if (piece.type === 'man') {
          if (piece.playerId === botId) {
            score += sign * (r / size) * 0.5;
          } else {
            score += sign * ((size - 1 - r) / size) * 0.5;
          }
        }

        const centerDist = Math.abs(r - center) + Math.abs(c - center);
        score += sign * (size - centerDist) * 0.05;
      }
    }

    return score;
  }
}
