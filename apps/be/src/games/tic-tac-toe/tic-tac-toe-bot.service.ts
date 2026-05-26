import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { TicTacToeService } from './tic-tac-toe.service';
import type { GameSessionSummary } from '../sessions/game-sessions.service';
import {
  GAME_PHASE,
  type BoardSize,
} from '../engines/tic-tac-toe/tic-tac-toe.constants';
import type {
  CellValue,
  PlaceMarkPayload,
  TicTacToeState,
} from '../engines/tic-tac-toe/tic-tac-toe.types';
import {
  findWinningLine,
  isBoardFull,
} from '../engines/tic-tac-toe/tic-tac-toe.utils';

const MOVE_DELAY_MS = { min: 400, max: 1100 };

@Injectable()
export class TicTacToeBotService {
  private readonly logger = new Logger(TicTacToeBotService.name);
  private readonly processing = new Set<string>();

  constructor(
    @Inject(forwardRef(() => TicTacToeService))
    private readonly ticTacToeService: TicTacToeService,
  ) {}

  isBot(userId: string): boolean {
    return userId.startsWith('bot-');
  }

  async checkAndPlay(session: GameSessionSummary): Promise<void> {
    if (session.status !== 'active') return;
    const state = session.state as unknown as TicTacToeState | undefined;
    if (!state || state.phase !== GAME_PHASE.PLAYING) return;

    const currentShooterId = this.getCurrentShooterId(state);
    if (!currentShooterId || !this.isBot(currentShooterId)) return;

    const lockKey = `${session.roomId}:${currentShooterId}`;
    if (this.processing.has(lockKey)) return;
    this.processing.add(lockKey);

    try {
      await this.randomDelay(MOVE_DELAY_MS);
      const move = this.pickMove(state, currentShooterId);
      if (!move) return;
      await this.ticTacToeService.placeMark(
        currentShooterId,
        session.roomId,
        move,
      );
    } catch (error) {
      this.logger.error(`Bot ${currentShooterId} failed to play: ${error}`);
    } finally {
      this.processing.delete(lockKey);
    }
  }

  /**
   * Pick a move for the bot. Strategy varies by boardSize:
   * - 3 → perfect minimax (only ~9 cells, trivially fast)
   * - 5 → heuristic: win → block → center bias
   * - 7, 9 → heuristic: win → block → random
   */
  pickMove(state: TicTacToeState, botId: string): PlaceMarkPayload | null {
    const ownerId = this.getOwnerId(state, botId);
    if (!ownerId) return null;
    const opponentIds = this.getOpponentIds(state, ownerId);
    const size = state.options.boardSize;

    if (size === 3) {
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

    if (size === 5) {
      return this.centerBiasedRandom(state);
    }
    return this.randomEmptyCell(state);
  }

  private findWinningMove(
    state: TicTacToeState,
    ownerId: string,
  ): PlaceMarkPayload | null {
    const size = state.options.boardSize;
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

  private minimaxMove(
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

    const size = state.options.boardSize;
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

  private centerBiasedRandom(state: TicTacToeState): PlaceMarkPayload | null {
    const size = state.options.boardSize;
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

  private randomEmptyCell(state: TicTacToeState): PlaceMarkPayload | null {
    const size = state.options.boardSize;
    const empties: PlaceMarkPayload[] = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (state.board[row][col] === null) empties.push({ row, col });
      }
    }
    if (empties.length === 0) return null;
    return empties[Math.floor(Math.random() * empties.length)];
  }

  private getOwnerId(state: TicTacToeState, botId: string): string | null {
    if (state.options.teamMode) {
      const player = state.players.find((p) => p.playerId === botId);
      return player?.teamId ?? null;
    }
    return botId;
  }

  private getOpponentIds(state: TicTacToeState, ownerId: string): string[] {
    if (state.options.teamMode) {
      return state.playerOrder.filter((id) => id !== ownerId);
    }
    return state.players
      .filter((p) => p.playerId !== ownerId && p.alive)
      .map((p) => p.playerId);
  }

  private getCurrentShooterId(state: TicTacToeState): string | null {
    const currentEntryId = state.playerOrder[state.currentTurnIndex];
    if (!currentEntryId) return null;
    if (!state.options.teamMode) return currentEntryId;
    const team = state.teams.find((t) => t.id === currentEntryId);
    return team ? team.playerIds[team.currentShooterIndex] : null;
  }

  private cloneBoard(board: CellValue[][]): CellValue[][] {
    return board.map((row) => [...row]);
  }

  private async randomDelay(range: { min: number; max: number }) {
    const ms = range.min + Math.random() * (range.max - range.min);
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Exposed for test inspection; not part of the public API.
  /** @internal */
  _boardSizeGuard(size: number): size is BoardSize {
    return size === 3 || size === 5 || size === 7 || size === 9;
  }
}
