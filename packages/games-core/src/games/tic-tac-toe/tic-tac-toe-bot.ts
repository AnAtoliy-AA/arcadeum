import type {
  CellValue,
  PlaceMarkPayload,
  TicTacToeState,
} from './tic-tac-toe.types';
import { findWinningLine, isBoardFull } from './tic-tac-toe.utils';
import { randomInt } from '../../lib/random';

/**
 * Framework-agnostic Tic-Tac-Toe bot decision logic.
 *
 * Strategy varies by boardSize and difficulty:
 * - easy → mostly random moves (occasionally takes an obvious win)
 * - 3×3 medium+ → perfect minimax (the game is solved at this size)
 * - medium → heuristic: win → block → center bias (5×5) / random
 * - hard → heuristic: win → block → center bias on every board
 * - expert → win → block → line-potential search (like gomoku scoring)
 */
export class TicTacToeBot {
  pickMove(state: TicTacToeState, botId: string): PlaceMarkPayload | null {
    const ownerId = this.getOwnerId(state, botId);
    if (!ownerId) return null;
    if (!state.board || state.board.length === 0) return null;
    const opponentIds = this.getOpponentIds(state, ownerId);
    const size = state.board.length;
    const boardSize = state.options.boardSize;
    const difficulty = state.options.aiDifficulty ?? 'medium';

    if (difficulty === 'easy') {
      // Mostly random — only takes an obvious win 15% of the time so it
      // still "plays" the game instead of auto-losing every time.
      if (Math.random() < 0.15) {
        const winMove = this.findWinningMove(state, ownerId);
        if (winMove) return winMove;
      }
      return this.randomEmptyCell(state);
    }

    if (boardSize === 3) {
      return this.minimaxMove(state, ownerId, opponentIds);
    }

    // Common: win immediately if possible
    const winMove = this.findWinningMove(state, ownerId);
    if (winMove) return winMove;

    // Block any single opponent's immediate win
    for (const opp of opponentIds) {
      const block = this.findWinningMove(state, opp);
      if (block) return block;
    }

    if (difficulty === 'expert') {
      return this.linePotentialMove(state, ownerId, opponentIds);
    }

    if (difficulty === 'hard' || size === 5) {
      return this.centerBiasedRandom(state);
    }

    return this.randomEmptyCell(state);
  }

  /**
   * Score every empty cell by the longest open line it belongs to (own
   * potential plus the strongest opponent line it would block), then pick a
   * random cell among the best scorers. This gives a competent "gomoku-ish"
   * player on 5×5+ boards where full minimax is too expensive.
   */
  protected linePotentialMove(
    state: TicTacToeState,
    ownerId: string,
    opponentIds: string[],
  ): PlaceMarkPayload | null {
    const size = state.board.length;
    const center = (size - 1) / 2;
    const empties: Array<PlaceMarkPayload & { score: number }> = [];

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (state.board[row][col] !== null) continue;
        const ownPotential = this.lineThroughPotential(
          state.board,
          row,
          col,
          ownerId,
          size,
          state.winLength,
        );
        let oppPotential = 0;
        for (const opp of opponentIds) {
          oppPotential = Math.max(
            oppPotential,
            this.lineThroughPotential(
              state.board,
              row,
              col,
              opp,
              size,
              state.winLength,
            ),
          );
        }
        const centerBias =
          1 - (Math.abs(row - center) + Math.abs(col - center)) / size;
        empties.push({
          row,
          col,
          score: ownPotential * 2 + oppPotential + centerBias,
        });
      }
    }

    if (empties.length === 0) return null;
    const maxScore = Math.max(...empties.map((e) => e.score));
    const best = empties.filter((e) => e.score === maxScore);
    const pick = best[Math.floor(Math.random() * best.length)];
    return pick ? { row: pick.row, col: pick.col } : null;
  }

  /**
   * Longest contiguous run of (empty | own cells) passing through (row,col)
   * along any direction, capped at winLength — a proxy for how many winning
   * lines that cell participates in.
   */
  protected lineThroughPotential(
    board: CellValue[][],
    row: number,
    col: number,
    playerId: string,
    size: number,
    winLength: number,
  ): number {
    let best = 0;
    const directions: Array<[number, number]> = [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, -1],
    ];
    for (const [dr, dc] of directions) {
      let count = 1;
      for (let i = 1; i < winLength; i++) {
        const nr = row + dr * i;
        const nc = col + dc * i;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) break;
        const cell = board[nr][nc];
        if (cell === null || cell === playerId) count++;
        else break;
      }
      for (let i = 1; i < winLength; i++) {
        const nr = row - dr * i;
        const nc = col - dc * i;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) break;
        const cell = board[nr][nc];
        if (cell === null || cell === playerId) count++;
        else break;
      }
      if (count > best) best = count;
    }
    return best;
  }

  protected findWinningMove(
    state: TicTacToeState,
    ownerId: string,
  ): PlaceMarkPayload | null {
    const size = state.board.length;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (state.board[row][col] !== null) continue;
        const probe = this.cloneBoard(state.board);
        probe[row][col] = ownerId;
        if (findWinningLine(probe, size, state.winLength, ownerId)) {
          return { row, col };
        }
      }
    }
    return null;
  }

  protected minimaxMove(
    state: TicTacToeState,
    ownerId: string,
    opponentIds: string[],
  ): PlaceMarkPayload | null {
    // Restrict to 2-player FFA on 3×3 for the perfect path; otherwise fall back
    // to the same heuristic used for 5×5.
    if (opponentIds.length !== 1) {
      return (
        this.findWinningMove(state, ownerId) ??
        this.findWinningMove(state, opponentIds[0] ?? '') ??
        this.centerBiasedRandom(state)
      );
    }

    const opponentId = opponentIds[0];
    let bestScore = -Infinity;
    let bestMove: PlaceMarkPayload | null = null;

    const size = state.board.length;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (state.board[row][col] !== null) continue;
        const probe = this.cloneBoard(state.board);
        probe[row][col] = ownerId;
        const score = this.minimax(
          probe,
          size,
          state.winLength,
          ownerId,
          opponentId,
          false,
          0,
        );
        if (score > bestScore) {
          bestScore = score;
          bestMove = { row, col };
        }
      }
    }
    return bestMove ?? this.randomEmptyCell(state);
  }

  private minimax(
    board: CellValue[][],
    size: number,
    winLength: number,
    me: string,
    opponent: string,
    isMyTurn: boolean,
    depth: number,
  ): number {
    if (findWinningLine(board, size, winLength, me)) return 10 - depth;
    if (findWinningLine(board, size, winLength, opponent)) return depth - 10;
    if (isBoardFull(board)) return 0;

    const current = isMyTurn ? me : opponent;
    let best = isMyTurn ? -Infinity : Infinity;

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] !== null) continue;
        board[row][col] = current;
        const score = this.minimax(
          board,
          size,
          winLength,
          me,
          opponent,
          !isMyTurn,
          depth + 1,
        );
        board[row][col] = null;
        best = isMyTurn ? Math.max(best, score) : Math.min(best, score);
      }
    }
    return best;
  }

  protected centerBiasedRandom(state: TicTacToeState): PlaceMarkPayload | null {
    const size = state.board.length;
    const center = Math.floor(size / 2);
    const empties: Array<PlaceMarkPayload & { weight: number }> = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (state.board[row][col] !== null) continue;
        const dist = Math.abs(row - center) + Math.abs(col - center);
        empties.push({ row, col, weight: size - dist });
      }
    }
    if (empties.length === 0) return null;
    const totalWeight = empties.reduce((s, e) => s + Math.max(1, e.weight), 0);
    let r = Math.random() * totalWeight;
    for (const cell of empties) {
      r -= Math.max(1, cell.weight);
      if (r <= 0) return { row: cell.row, col: cell.col };
    }
    return { row: empties[0].row, col: empties[0].col };
  }

  protected randomEmptyCell(state: TicTacToeState): PlaceMarkPayload | null {
    const size = state.board.length;
    const empties: PlaceMarkPayload[] = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (state.board[row][col] === null) empties.push({ row, col });
      }
    }
    if (empties.length === 0) return null;
    return empties[randomInt(empties.length)];
  }

  protected getOwnerId(state: TicTacToeState, botId: string): string | null {
    if (state.options.teamMode) {
      const player = state.players.find((p) => p.playerId === botId);
      return player?.teamId ?? null;
    }
    return botId;
  }

  protected getOpponentIds(state: TicTacToeState, ownerId: string): string[] {
    if (state.options.teamMode) {
      return state.playerOrder.filter((id) => id !== ownerId);
    }
    return state.players
      .filter((p) => p.playerId !== ownerId && p.alive)
      .map((p) => p.playerId);
  }

  protected getCurrentShooterId(state: TicTacToeState): string | null {
    const currentEntryId = state.playerOrder[state.currentTurnIndex];
    if (!currentEntryId) return null;
    if (!state.options.teamMode) return currentEntryId;
    const team = state.teams.find((t) => t.id === currentEntryId);
    if (!team) return null;
    const shooterId = team.playerIds[team.currentShooterIndex];
    return shooterId ?? null;
  }

  private cloneBoard(board: CellValue[][]): CellValue[][] {
    return board.map((row) => [...row]);
  }
}
