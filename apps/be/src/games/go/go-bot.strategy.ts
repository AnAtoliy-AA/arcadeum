import { performance } from 'node:perf_hooks';
import type { AiDifficulty } from '../ai-difficulty';
import { KOMI, type StoneColor } from '../engines/go/go.constants';
import type { GoState, Point } from '../engines/go/go.types';
import {
  applyMove,
  groupAt,
  isOnBoard,
  isTrueEye,
  opponentOf,
  probePlacement,
  scoreBoard,
  secureRandomInt,
  shuffleInPlace,
  type Board,
} from '../engines/go/go.utils';

/** Upper bound on tree simulations per move. */
export const MCTS_SIMULATIONS: Record<'hard' | 'expert', number> = {
  hard: 220,
  expert: 550,
};

/**
 * Wall-clock budget per MCTS decision. Simulations stop early when exceeded so
 * the synchronous bot never blocks the Node.js event loop longer than this.
 */
export const MCTS_TIME_BUDGET_MS: Record<'hard' | 'expert', number> = {
  hard: 500,
  expert: 900,
};

const NEIGHBOURS: ReadonlyArray<readonly [number, number]> = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

/** Legal placements excluding own true eyes (filling eyes is pointless). */
export function playableMoves(state: GoState, color: StoneColor): Point[] {
  const moves: Point[] = [];
  for (let row = 0; row < state.boardSize; row++) {
    for (let col = 0; col < state.boardSize; col++) {
      if (state.board[row][col] !== null) continue;
      if (isTrueEye(state.board, color, row, col)) continue;
      if (
        state.koPoint &&
        state.koPoint.row === row &&
        state.koPoint.col === col
      ) {
        continue;
      }
      if (!probePlacement(state.board, color, row, col, false).ok) continue;
      moves.push({ row, col });
    }
  }
  return moves;
}

function countStones(board: Board): number {
  let count = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell !== null) count++;
    }
  }
  return count;
}

interface MoveFeatures {
  captures: number;
  selfLibertiesAfter: number;
  savedAtariGroups: number;
  newAtariOnEnemy: number;
  line: number;
  adjacentOwn: number;
}

function featuresFor(
  state: GoState,
  color: StoneColor,
  row: number,
  col: number,
): MoveFeatures {
  const outcome = applyMove(state.board, color, row, col);
  let savedAtariGroups = 0;
  let newAtariOnEnemy = 0;
  let adjacentOwn = 0;

  for (const [dr, dc] of NEIGHBOURS) {
    const r = row + dr;
    const c = col + dc;
    if (!isOnBoard(state.board, r, c)) continue;
    const cellBefore = state.board[r][c];
    const cellAfter = outcome.board[r][c];
    if (cellBefore === color) adjacentOwn++;
    if (cellAfter === null && cellBefore === opponentOf(color)) {
      savedAtariGroups++;
    }
    if (cellAfter === opponentOf(color)) {
      const group = groupAt(outcome.board, r, c);
      if (group.liberties.length === 1) newAtariOnEnemy++;
    }
  }

  const line =
    Math.min(row, col, state.boardSize - 1 - row, state.boardSize - 1 - col) +
    1;

  return {
    captures: outcome.capturedStones.length,
    selfLibertiesAfter: outcome.selfLibertiesAfter,
    savedAtariGroups,
    newAtariOnEnemy,
    line,
    adjacentOwn,
  };
}

export function scoreHeuristic(
  state: GoState,
  color: StoneColor,
  row: number,
  col: number,
): number {
  const f = featuresFor(state, color, row, col);
  let score = 0;

  score += f.captures * 120;
  score += f.savedAtariGroups * 90;
  score += f.newAtariOnEnemy * 35;

  if (f.selfLibertiesAfter <= 1 && f.captures === 0) score -= 55;
  else if (f.selfLibertiesAfter === 2) score -= 6;
  score += Math.min(f.selfLibertiesAfter, 5) * 4;

  const opening = countStones(state.board) < state.boardSize * 2;
  if (opening) {
    if (f.line === 3 || f.line === 4) score += 14;
    else if (f.line === 2) score -= 6;
    else if (f.line === 1) score -= 30;
    if (f.adjacentOwn === 0) score += 6;
  } else if (f.line === 1) {
    score -= 12;
  }

  return score + secureRandomInt(200) / 100;
}

/** Greedy one-ply heuristic — used for `medium`. */
export function pickGreedyMove(
  state: GoState,
  color: StoneColor,
): Point | null {
  const moves = playableMoves(state, color);
  if (moves.length === 0) return null;

  // If the opponent just passed and we lead on raw area, close the game.
  if (state.consecutivePasses > 0 && shouldAcceptPass(state, color)) {
    return null;
  }

  let best: Point = moves[0];
  let bestScore = -Infinity;
  for (const move of moves) {
    const s = scoreHeuristic(state, color, move.row, move.col);
    if (s > bestScore) {
      bestScore = s;
      best = move;
    }
  }
  return best;
}

function shouldAcceptPass(state: GoState, color: StoneColor): boolean {
  const scores = scoreBoard(state.board, KOMI);
  const mine = scores[color];
  const theirs = scores[opponentOf(color)];
  return mine > theirs;
}

// ---------------------------------------------------------------------------
// Monte-Carlo Tree Search — used for `hard` and `expert`.
// ---------------------------------------------------------------------------

interface PlayoutPosition {
  board: Board;
  koPoint: GoState['koPoint'];
  consecutivePasses: number;
  toMove: StoneColor;
}

interface McNode {
  position: PlayoutPosition;
  depth: number;
  move: Point | null;
  parent: McNode | null;
  children: McNode[];
  untriedMoves: Point[];
  wins: number;
  visits: number;
}

function uctSelect(node: McNode, exploration: number): McNode {
  let best = node.children[0];
  let bestValue = -Infinity;
  for (const child of node.children) {
    const value =
      child.wins / child.visits +
      exploration * Math.sqrt(Math.log(node.visits) / child.visits);
    if (value > bestValue) {
      bestValue = value;
      best = child;
    }
  }
  return best;
}

/**
 * Light playout policy: locality-biased candidates (points adjacent to any
 * stone), capture preference over a small random sample, everything evaluated
 * with in-place probes instead of full-board copies.
 */
function pickLightMove(
  board: Board,
  color: StoneColor,
  koPoint: GoState['koPoint'],
): Point | null {
  const size = board.length;
  const candidates: Point[] = [];
  const seen = new Set<number>();
  let hasStones = false;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === null) continue;
      hasStones = true;
      for (let dr = -1; dr <= 1; dr++) {
        const r = row + dr;
        if (r < 0 || r >= size) continue;
        for (let dc = -1; dc <= 1; dc++) {
          const c = col + dc;
          if (c < 0 || c >= size) continue;
          if (board[r][c] !== null) continue;
          const key = r * size + c;
          if (seen.has(key)) continue;
          seen.add(key);
          if (isTrueEye(board, color, r, c)) continue;
          if (koPoint && koPoint.row === r && koPoint.col === c) continue;
          candidates.push({ row: r, col: c });
        }
      }
    }
  }

  if (!hasStones) {
    // Empty board — play near the center.
    const mid = size >> 1;
    return { row: mid, col: mid };
  }
  if (candidates.length === 0) return null;

  // Probe up to a few random candidates looking for an immediate capture,
  // remembering the first legal fallback.
  let fallback: Point | null = null;
  const samples = Math.min(candidates.length, 4);
  for (let i = 0; i < samples; i++) {
    const m = candidates[secureRandomInt(candidates.length)];
    const probe = probePlacement(board, color, m.row, m.col, false);
    if (!probe.ok) continue;
    if (probe.capturedCount > 0) return m;
    if (!fallback) fallback = m;
  }
  return fallback ?? candidates[secureRandomInt(candidates.length)];
}

function playout(position: PlayoutPosition, rootColor: StoneColor): number {
  const board: Board = position.board.map((r) => [...r]);
  let koPoint = position.koPoint;
  let consecutivePasses = position.consecutivePasses;
  let toMove = position.toMove;
  const maxSteps = board.length * board.length * 2;
  let steps = 0;

  while (consecutivePasses < 2 && steps < maxSteps) {
    steps++;
    const move = pickLightMove(board, toMove, koPoint);
    if (!move) {
      consecutivePasses++;
      koPoint = null;
      toMove = opponentOf(toMove);
      continue;
    }
    // Commit mode reverts automatically when the move is illegal (suicide).
    const probe = probePlacement(board, toMove, move.row, move.col, true);
    if (!probe.ok) {
      consecutivePasses++;
      koPoint = null;
      toMove = opponentOf(toMove);
      continue;
    }
    koPoint = probe.koPoint;
    consecutivePasses = 0;
    toMove = opponentOf(toMove);
  }

  const scores = scoreBoard(board, KOMI);
  const mine = scores[rootColor];
  const theirs = scores[opponentOf(rootColor)];
  if (mine === theirs) return 0.5;
  return mine > theirs ? 1 : 0;
}

/**
 * Compact UCT Monte-Carlo Tree Search. Bounded by both a simulation cap and a
 * wall-clock time budget so worst-case event-loop blocking stays predictable.
 */
export function pickMctsMove(
  state: GoState,
  color: StoneColor,
  simulations: number,
  budgetMs: number,
): Point | null {
  const rootMoves = playableMoves(state, color);
  if (rootMoves.length === 0) return null;
  if (rootMoves.length === 1) return rootMoves[0];

  if (state.consecutivePasses > 0 && shouldAcceptPass(state, color)) {
    return null;
  }

  const root: McNode = {
    position: {
      board: state.board,
      koPoint: state.koPoint,
      consecutivePasses: state.consecutivePasses,
      toMove: color,
    },
    depth: 0,
    move: null,
    parent: null,
    children: [],
    untriedMoves: shuffleInPlace([...rootMoves]),
    wins: 0,
    visits: 0,
  };

  const deadline = performance.now() + budgetMs;
  let iterations = 0;
  while (iterations < simulations) {
    // Check the clock periodically rather than every iteration.
    if ((iterations & 7) === 7 && performance.now() >= deadline) break;
    iterations++;

    let node = root;

    // 1. Selection — walk fully-expanded nodes via UCB1.
    while (node.untriedMoves.length === 0 && node.children.length > 0) {
      node = uctSelect(node, 1.2);
    }

    // 2. Expansion.
    if (node.untriedMoves.length > 0) {
      const move = node.untriedMoves.pop() as Point;
      const outcome = applyMove(
        node.position.board,
        node.position.toMove,
        move.row,
        move.col,
      );
      node.children.push({
        position: {
          board: outcome.board,
          koPoint: outcome.koPoint,
          consecutivePasses: 0,
          toMove: opponentOf(node.position.toMove),
        },
        depth: node.depth + 1,
        move,
        parent: node,
        children: [],
        untriedMoves: [],
        wins: 0,
        visits: 0,
      });
      node = node.children[node.children.length - 1];
    }

    // 3. Simulation + 4. Backpropagation. Rewards are stored from the
    // perspective of the player who made each node's move (zero-sum flip per
    // ply), so UCT selection models a hostile opponent at every level.
    const reward = playout(node.position, color);
    let backprop: McNode | null = node;
    while (backprop) {
      backprop.visits++;
      backprop.wins +=
        backprop.depth % 2 === 1 ? reward : /* zero-sum ply flip */ 1 - reward;
      backprop = backprop.parent;
    }
  }

  if (root.children.length === 0) return null;
  let bestChild = root.children[0];
  for (const child of root.children) {
    if (child.visits > bestChild.visits) bestChild = child;
  }
  return bestChild.move;
}

export function pickStrategyMove(
  state: GoState,
  color: StoneColor,
  difficulty: AiDifficulty,
): Point | 'pass' | null {
  const playable = playableMoves(state, color);
  if (playable.length === 0) return 'pass';

  if (difficulty === 'easy') {
    // Random, but never throw away a free capture.
    let fallback: Point | null = null;
    for (const m of shuffleInPlace([...playable])) {
      const probe = probePlacement(state.board, color, m.row, m.col, false);
      if (!probe.ok) continue;
      if (probe.capturedCount > 0) return m;
      if (!fallback) fallback = m;
    }
    return fallback ?? playable[secureRandomInt(playable.length)];
  }

  if (difficulty === 'medium') {
    return pickGreedyMove(state, color) ?? 'pass';
  }

  const tier = difficulty === 'expert' ? 'expert' : 'hard';
  return (
    pickMctsMove(
      state,
      color,
      MCTS_SIMULATIONS[tier],
      MCTS_TIME_BUDGET_MS[tier],
    ) ?? 'pass'
  );
}
