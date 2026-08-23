import type { AiDifficulty } from '../ai-difficulty';
import { KOMI, type StoneColor } from '../engines/go/go.constants';
import type { GoState, Point } from '../engines/go/go.types';
import {
  applyMove,
  groupAt,
  isOnBoard,
  isTrueEye,
  opponentOf,
  scoreBoard,
} from '../engines/go/go.utils';

export const MCTS_SIMULATIONS: Record<'hard' | 'expert', number> = {
  hard: 220,
  expert: 550,
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
      const outcome = applyMove(state.board, color, row, col);
      if (outcome.isSuicide) continue;
      moves.push({ row, col });
    }
  }
  return moves;
}

function countStones(board: GoState['board']): number {
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

  return score + Math.random() * 2;
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
  board: GoState['board'];
  koPoint: GoState['koPoint'];
  consecutivePasses: number;
  toMove: StoneColor;
}

interface McNode {
  position: PlayoutPosition;
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

function playout(position: PlayoutPosition, rootColor: StoneColor): number {
  let current: PlayoutPosition = {
    ...position,
    board: position.board.map((r) => [...r]),
  };
  const maxSteps = current.board.length * current.board.length * 2;
  let steps = 0;

  while (current.consecutivePasses < 2 && steps < maxSteps) {
    steps++;
    const moves = quickCandidates(current, current.toMove);
    if (moves.length === 0) {
      current = {
        ...current,
        consecutivePasses: current.consecutivePasses + 1,
        koPoint: null,
        toMove: opponentOf(current.toMove),
      };
      continue;
    }
    // Light playout policy: prefer captures, otherwise uniform random.
    const move =
      moves.find((m) => hasCaptureAt(current, current.toMove, m)) ??
      moves[Math.floor(Math.random() * moves.length)];
    const outcome = applyMove(
      current.board,
      current.toMove,
      move.row,
      move.col,
    );
    current = {
      board: outcome.board,
      koPoint: outcome.koPoint,
      consecutivePasses: 0,
      toMove: opponentOf(current.toMove),
    };
  }

  const scores = scoreBoard(current.board, KOMI);
  const mine = scores[rootColor];
  const theirs = scores[opponentOf(rootColor)];
  if (mine === theirs) return 0.5;
  return mine > theirs ? 1 : 0;
}

function hasCaptureAt(
  position: PlayoutPosition,
  color: StoneColor,
  move: Point,
): boolean {
  const outcome = applyMove(position.board, color, move.row, move.col);
  return outcome.capturedStones.length > 0;
}

function quickCandidates(
  position: PlayoutPosition,
  color: StoneColor,
): Point[] {
  const moves: Point[] = [];
  const board = position.board;
  const size = board.length;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] !== null) continue;
      if (isTrueEye(board, color, row, col)) continue;
      if (
        position.koPoint &&
        position.koPoint.row === row &&
        position.koPoint.col === col
      ) {
        continue;
      }
      const outcome = applyMove(board, color, row, col);
      if (outcome.isSuicide) continue;
      moves.push({ row, col });
    }
  }
  return moves;
}

/**
 * Compact UCT Monte-Carlo Tree Search. Simulation counts are modest so the
 * worst-case latency stays acceptable for casual online play.
 */
export function pickMctsMove(
  state: GoState,
  color: StoneColor,
  simulations: number,
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
    move: null,
    parent: null,
    children: [],
    untriedMoves: [...rootMoves].sort(() => Math.random() - 0.5),
    wins: 0,
    visits: 0,
  };

  for (let i = 0; i < simulations; i++) {
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
        move,
        parent: node,
        children: [],
        untriedMoves: [],
        wins: 0,
        visits: 0,
      });
      node = node.children[node.children.length - 1];
    }

    // 3. Simulation + 4. Backpropagation.
    const reward = playout(node.position, color);
    let backprop: McNode | null = node;
    while (backprop) {
      backprop.visits++;
      backprop.wins += reward;
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
    const capture = playable.find((m) =>
      hasCaptureAt(
        {
          board: state.board,
          koPoint: state.koPoint,
          consecutivePasses: state.consecutivePasses,
          toMove: color,
        },
        color,
        m,
      ),
    );
    if (capture) return capture;
    return playable[Math.floor(Math.random() * playable.length)];
  }

  if (difficulty === 'medium') {
    return pickGreedyMove(state, color) ?? 'pass';
  }

  const sims =
    difficulty === 'expert' ? MCTS_SIMULATIONS.expert : MCTS_SIMULATIONS.hard;
  return pickMctsMove(state, color, sims) ?? 'pass';
}
