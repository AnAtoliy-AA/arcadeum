/**
 * Framework-agnostic chess bot decision logic (search, eval, move picking).
 */
import { PIECE_VALUES } from './chess.constants';
import type { ChessMove, ChessState } from './chess.types';
import { oppositeColor } from './chess.board';
import { getLegalMoves } from './chess.move-generator';
import { isInCheck } from './chess.attacks';
import { evaluate, CHECKMATE } from './chess-bot-eval';
import {
  applyBotMove,
  hasNonPawnMaterial,
  hashState,
  scoreMove,
} from './chess-bot-utils';
import type { AiDifficulty } from '../../lib/ai-difficulty';
import type { BotPersonality } from './chess-bot-personalities';
import { getOpeningMove } from './chess-bot-openings';
import { toFen } from './chess-fen';

const INFINITY = 999999;
const TT_SIZE = 1 << 20;
const TT_MASK = TT_SIZE - 1;

const enum TTFlag {
  EXACT,
  LOWER,
  UPPER,
}

interface TTEntry {
  key: number;
  depth: number;
  score: number;
  flag: TTFlag;
  bestMove: ChessMove | null;
}

type BotDifficulty = AiDifficulty;

interface DifficultyConfig {
  maxDepth: number;
  quiescenceDepth: number;
  useNullMove: boolean;
  useLMR: boolean;
  noiseCentipawns: number;
}

const DIFFICULTY: Record<BotDifficulty, DifficultyConfig> = {
  easy: {
    maxDepth: 2,
    quiescenceDepth: 0,
    useNullMove: false,
    useLMR: false,
    noiseCentipawns: 80,
  },
  medium: {
    maxDepth: 3,
    quiescenceDepth: 4,
    useNullMove: false,
    useLMR: false,
    noiseCentipawns: 20,
  },
  hard: {
    maxDepth: 4,
    quiescenceDepth: 6,
    useNullMove: true,
    useLMR: true,
    noiseCentipawns: 0,
  },
  expert: {
    maxDepth: 6,
    quiescenceDepth: 8,
    useNullMove: true,
    useLMR: true,
    noiseCentipawns: 0,
  },
};

export class ChessBot {
  protected readonly tt = new Map<number, TTEntry>();
  protected killers: ChessMove[][] = [];
  protected history: number[][] = [];
  protected currentDifficulty: BotDifficulty = 'medium';
  protected currentPersonality: BotPersonality | null = null;

  setDifficulty(d: BotDifficulty) {
    this.currentDifficulty = d;
  }

  setPersonality(p: BotPersonality | null) {
    this.currentPersonality = p;
  }

  private get evalModifiers() {
    return this.currentPersonality?.evaluationModifiers ?? null;
  }

  findBestMove(state: ChessState): ChessMove | null {
    if (!this.killers.length) {
      this.killers = Array.from({ length: 20 }, (): ChessMove[] => []);
      this.history = Array.from({ length: 8 }, (): number[] => [
        0, 0, 0, 0, 0, 0, 0, 0,
      ]);
    }

    const personality = this.currentPersonality;
    const difficulty = state.botDifficulty ?? this.currentDifficulty;
    const cfg = DIFFICULTY[difficulty];
    const legalMoves = getLegalMoves(state, state.currentTurnColor);
    if (legalMoves.length === 0) return null;
    if (legalMoves.length === 1) return legalMoves[0];

    if (personality) {
      const fen = toFen(state);
      const openingMove = getOpeningMove(
        personality.id,
        state.currentTurnColor,
        fen,
      );
      if (openingMove) {
        const match = legalMoves.find(
          (m) =>
            `${m.from.file}${m.from.rank}${m.to.file}${m.to.rank}` ===
            openingMove,
        );
        if (match) return match;
      }
    }

    const ordered = this.orderMoves(state, legalMoves, null, 0);
    let bestScore = -INFINITY;
    let bestMoves: ChessMove[] = [];

    for (const move of ordered) {
      const newState = applyBotMove(state, move);
      const score = -this.alphaBeta(
        newState,
        cfg.maxDepth - 1,
        -INFINITY,
        INFINITY,
        cfg,
        1,
      );

      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    }

    if (cfg.noiseCentipawns > 0 && bestMoves.length > 1) {
      const noisy = bestMoves.map((m) => ({
        move: m,
        score: bestScore + (Math.random() - 0.5) * cfg.noiseCentipawns,
      }));
      noisy.sort((a, b) => b.score - a.score);
      return noisy[0].move;
    }

    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }

  protected findBestMoveWithTimeBudget(
    state: ChessState,
    timeBudgetMs: number,
    startTime: number,
  ): ChessMove | null {
    const personality = this.currentPersonality;
    const difficulty = state.botDifficulty ?? this.currentDifficulty;
    const cfg = DIFFICULTY[difficulty];
    const legalMoves = getLegalMoves(state, state.currentTurnColor);
    if (legalMoves.length === 0) return null;
    if (legalMoves.length === 1) return legalMoves[0];

    if (personality) {
      const fen = toFen(state);
      const openingMove = getOpeningMove(
        personality.id,
        state.currentTurnColor,
        fen,
      );
      if (openingMove) {
        const match = legalMoves.find(
          (m) =>
            `${m.from.file}${m.from.rank}${m.to.file}${m.to.rank}` ===
            openingMove,
        );
        if (match) return match;
      }
    }

    let bestMove: ChessMove = legalMoves[0];
    let bestScore = -INFINITY;
    const deadline = startTime + timeBudgetMs;

    for (let depth = 1; depth <= cfg.maxDepth; depth++) {
      const depthCfg = { ...cfg, maxDepth: depth };
      const ordered = this.orderMoves(state, legalMoves, null, 0);
      let iterationBest = -INFINITY;
      let iterationMoves: ChessMove[] = [];

      for (const move of ordered) {
        if (Date.now() >= deadline) break;
        const newState = applyBotMove(state, move);
        const score = -this.alphaBeta(
          newState,
          depth - 1,
          -INFINITY,
          INFINITY,
          depthCfg,
          1,
        );
        if (score > iterationBest) {
          iterationBest = score;
          iterationMoves = [move];
        } else if (score === iterationBest) {
          iterationMoves.push(move);
        }
      }

      if (Date.now() >= deadline) break;
      if (iterationBest > bestScore) {
        bestScore = iterationBest;
        bestMove =
          iterationMoves[Math.floor(Math.random() * iterationMoves.length)];
      }
    }

    return bestMove;
  }

  protected computeTimeBudget(state: ChessState): number {
    if (!state.clocks) return 2000;
    const clock = state.clocks[state.currentTurnColor];
    if (!clock) return 2000;
    const remaining = clock.remainingSeconds;
    if (remaining <= 10) return Math.min(500, remaining * 30);
    if (remaining <= 60) return Math.min(2000, remaining * 15);
    return Math.min(5000, remaining * 5);
  }

  private alphaBeta(
    state: ChessState,
    depth: number,
    alpha: number,
    beta: number,
    cfg: DifficultyConfig,
    ply: number,
  ): number {
    const inCheck = isInCheck(state.board, state.currentTurnColor);

    if (depth <= 0 && !inCheck) {
      return this.quiesce(state, alpha, beta, cfg.quiescenceDepth, ply);
    }

    const ttKey = hashState(state);
    const ttEntry = this.tt.get(ttKey & TT_MASK);
    if (ttEntry && ttEntry.key === ttKey && ttEntry.depth >= depth) {
      if (ttEntry.flag === TTFlag.EXACT) return ttEntry.score;
      if (ttEntry.flag === TTFlag.LOWER && ttEntry.score >= beta)
        return ttEntry.score;
      if (ttEntry.flag === TTFlag.UPPER && ttEntry.score <= alpha)
        return ttEntry.score;
    }

    if (depth === 0) return evaluate(state, this.evalModifiers ?? undefined);

    const legalMoves = getLegalMoves(state, state.currentTurnColor);
    if (legalMoves.length === 0) {
      return inCheck ? -(CHECKMATE - ply) : 0;
    }

    if (
      cfg.useNullMove &&
      !inCheck &&
      depth >= 3 &&
      hasNonPawnMaterial(state)
    ) {
      const nullState = {
        ...state,
        currentTurnColor: oppositeColor(state.currentTurnColor),
        enPassantTarget: null,
      };
      const nullScore = -this.alphaBeta(
        nullState,
        depth - 3,
        -beta,
        -beta + 1,
        cfg,
        ply + 1,
      );
      if (nullScore >= beta) return beta;
    }

    const bestMove = ttEntry?.key === ttKey ? ttEntry.bestMove : null;
    const ordered = this.orderMoves(state, legalMoves, bestMove, ply);

    let bestScore = -INFINITY;
    let bestMoveFound: ChessMove | null = null;
    let flag = TTFlag.UPPER;

    for (let i = 0; i < ordered.length; i++) {
      const move = ordered[i];
      const newState = applyBotMove(state, move);

      let score: number;
      if (i === 0) {
        score = -this.alphaBeta(
          newState,
          depth - 1,
          -beta,
          -alpha,
          cfg,
          ply + 1,
        );
      } else if (
        cfg.useLMR &&
        i >= 4 &&
        depth >= 3 &&
        !move.captured &&
        !move.promotion &&
        !inCheck
      ) {
        score = -this.alphaBeta(
          newState,
          depth - 2,
          -alpha - 1,
          -alpha,
          cfg,
          ply + 1,
        );
        if (score > alpha) {
          score = -this.alphaBeta(
            newState,
            depth - 1,
            -beta,
            -alpha,
            cfg,
            ply + 1,
          );
        }
      } else {
        score = -this.alphaBeta(
          newState,
          depth - 1,
          -beta,
          -alpha,
          cfg,
          ply + 1,
        );
      }

      if (score > bestScore) {
        bestScore = score;
        bestMoveFound = move;
      }
      if (score > alpha) alpha = score;
      if (score >= beta) {
        if (!move.captured) {
          this.killers[ply] = this.killers[ply] || [];
          this.killers[ply].unshift(move);
          if (this.killers[ply].length > 2) this.killers[ply].pop();
          const ff = move.from.file.charCodeAt(0) - 97;
          const fr = 8 - move.from.rank;
          this.history[fr][ff] += depth * depth;
        }
        flag = TTFlag.LOWER;
        break;
      }
    }

    this.tt.set(ttKey & TT_MASK, {
      key: ttKey,
      depth,
      score: bestScore,
      flag,
      bestMove: bestMoveFound,
    });
    return bestScore;
  }

  private quiesce(
    state: ChessState,
    alpha: number,
    beta: number,
    depthLeft: number,
    ply: number,
  ): number {
    const standPat = evaluate(state, this.evalModifiers ?? undefined);
    if (depthLeft === 0) return standPat;
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;

    const captures = getLegalMoves(state, state.currentTurnColor).filter(
      (m) => m.captured,
    );
    captures.sort((a, b) => {
      const va = a.captured
        ? PIECE_VALUES[a.captured.type] * 10 - PIECE_VALUES[a.piece.type]
        : 0;
      const vb = b.captured
        ? PIECE_VALUES[b.captured.type] * 10 - PIECE_VALUES[b.piece.type]
        : 0;
      return vb - va;
    });

    for (const move of captures) {
      if (
        move.captured &&
        PIECE_VALUES[move.captured.type] * 100 + standPat < alpha - 200
      )
        continue;
      const newState = applyBotMove(state, move);
      const score = -this.quiesce(
        newState,
        -beta,
        -alpha,
        depthLeft - 1,
        ply + 1,
      );
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  }

  private orderMoves(
    state: ChessState,
    moves: ChessMove[],
    ttMove: ChessMove | null,
    ply: number,
  ): ChessMove[] {
    const killers = this.killers[ply] || [];
    return [...moves].sort((a, b) => {
      if (
        ttMove &&
        a.from.file === ttMove.from.file &&
        a.from.rank === ttMove.from.rank &&
        a.to.file === ttMove.to.file &&
        a.to.rank === ttMove.to.rank
      )
        return -1;
      if (
        ttMove &&
        b.from.file === ttMove.from.file &&
        b.from.rank === ttMove.from.rank &&
        b.to.file === ttMove.to.file &&
        b.to.rank === ttMove.to.rank
      )
        return 1;

      return (
        scoreMove(b, killers, this.history) -
        scoreMove(a, killers, this.history)
      );
    });
  }

  private findKingOnRank(
    board: ChessState['board'],
    rank: number,
    color: 'white' | 'black',
  ): number | null {
    const row = 8 - rank;
    for (let f = 0; f < 8; f++) {
      if (board[row][f]?.type === 'king' && board[row][f]?.color === color)
        return f;
    }
    return null;
  }
}
