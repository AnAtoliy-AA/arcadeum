import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { PachisiService } from './pachisi.service';
import type { GameSessionSummary } from '../sessions/game-sessions.service';
import {
  FINISH_PROGRESS,
  GAME_PHASE,
  MAIN_PATH_STEPS,
  SEAT_START_OFFSETS,
  STAR_CELLS,
} from '../engines/pachisi/pachisi.constants';
import type {
  LegalMove,
  MoveTokenPayload,
  PachisiState,
} from '../engines/pachisi/pachisi.types';
import {
  absoluteCell,
  computeMoveOutcome,
  getAllLegalMoves,
  tokensByPlayer,
} from '../engines/pachisi/pachisi.utils';
import { getAiMoveDelayMs, isAiVsAiSession } from '../common/ai-vs-ai';
import { BotTurnLock } from '../common/bot-turn-lock';

const MOVE_DELAY_MS = { min: 400, max: 900 };

/** Heuristic weights (basic positional strategy). */
const SCORE = {
  finish: 120,
  captureBase: 60,
  exitYard: 55,
  enterLane: 40,
  landSafe: 12,
  dangerPenalty: -18,
  stackOwnStart: 6,
};

@Injectable()
export class PachisiBotService {
  private readonly logger = new Logger(PachisiBotService.name);
  /** TTL-based single-flight lock so a hung chain cannot deadlock a room. */
  private readonly turnLock = new BotTurnLock();

  constructor(
    @Inject(forwardRef(() => PachisiService))
    private readonly pachisiService: PachisiService,
  ) {}

  isBot(userId: string): boolean {
    return userId.startsWith('bot-');
  }

  async checkAndPlay(session: GameSessionSummary): Promise<void> {
    if (session.status !== 'active') return;
    const state = session.state as unknown as PachisiState | undefined;
    if (!state || state.phase === GAME_PHASE.GAME_OVER) return;

    const hasAliveHuman = state.players.some(
      (p) => p.alive && !this.isBot(p.playerId),
    );
    if (!hasAliveHuman && !isAiVsAiSession(session)) {
      await this.pachisiService.completeSession(session.id, session.roomId);
      return;
    }

    const currentTurnPlayerId = state.playerOrder[state.currentTurnIndex];
    if (!currentTurnPlayerId || !this.isBot(currentTurnPlayerId)) return;

    const lockKey = `${session.roomId}:${currentTurnPlayerId}`;
    if (!this.turnLock.tryAcquire(lockKey)) return;

    try {
      let currentSession = session;
      let currentState = currentSession.state as unknown as
        PachisiState | undefined;

      while (
        currentSession.status === 'active' &&
        currentState &&
        currentState.phase !== GAME_PHASE.GAME_OVER &&
        currentState.playerOrder[currentState.currentTurnIndex] ===
          currentTurnPlayerId
      ) {
        const aiDelay = getAiMoveDelayMs(currentSession);
        const delayMs =
          aiDelay ??
          MOVE_DELAY_MS.min +
            Math.floor(Math.random() * (MOVE_DELAY_MS.max - MOVE_DELAY_MS.min));
        await this.delay(delayMs);

        if (currentState.phase === GAME_PHASE.ROLL) {
          const updated = await this.pachisiService.rollDice(
            currentTurnPlayerId,
            currentSession.roomId,
          );
          currentSession = updated;
          currentState = updated.state as unknown as PachisiState;
        } else if (currentState.phase === GAME_PHASE.MOVE) {
          const move = this.pickMove(currentState, currentTurnPlayerId);
          if (!move) {
            // Defensive fallback: if the bot is stuck in MOVE with no legal
            // moves (state drift), pass the turn instead of deadlocking.
            const updated = await this.pachisiService.passTurn(
              currentTurnPlayerId,
              currentSession.roomId,
            );
            currentSession = updated;
            currentState = updated.state as unknown as PachisiState;
            continue;
          }
          const updated = await this.pachisiService.moveToken(
            currentTurnPlayerId,
            currentSession.roomId,
            move.tokenId,
          );
          currentSession = updated;
          currentState = updated.state as unknown as PachisiState;
        } else {
          break;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Bot ${currentTurnPlayerId} error: ${message}`);
    } finally {
      this.turnLock.release(lockKey);
    }
  }

  pickMove(state: PachisiState, botId: string): MoveTokenPayload | null {
    const legalMoves = getAllLegalMoves(state, botId);
    if (legalMoves.length === 0) return null;

    const difficulty = state.options.aiDifficulty ?? 'medium';
    if (difficulty === 'easy') {
      const chosen = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      return { tokenId: chosen.tokenId };
    }

    let bestScore = -Infinity;
    let best = legalMoves[0];
    for (const move of legalMoves) {
      let score = this.scoreMove(state, botId, move);
      if (difficulty === 'expert')
        score += this.expertBonus(state, botId, move);
      if (score > bestScore) {
        bestScore = score;
        best = move;
      }
    }
    return { tokenId: best.tokenId };
  }

  /**
   * One-ply positional heuristic. Medium uses a reduced subset (progress,
   * finish, capture, exit); hard/expert add lane entry, safe landing and
   * danger avoidance.
   */
  private scoreMove(
    state: PachisiState,
    botId: string,
    move: LegalMove,
  ): number {
    const outcome = computeMoveOutcome(state, botId, move.tokenId);
    if (!outcome) return -Infinity;

    const token = tokensByPlayer(state, botId).find(
      (t) => t.id === move.tokenId,
    );

    let score = outcome.targetProgress / 4;

    if (outcome.targetProgress === FINISH_PROGRESS) score += SCORE.finish;

    if (outcome.captured.length > 0) {
      const maxVictimProgress = Math.max(
        ...outcome.captured.map(({ ownerId, tokenId }) => {
          const victim = tokensByPlayer(state, ownerId)?.find(
            (t) => t.id === tokenId,
          );
          return victim?.progress ?? 0;
        }),
      );
      score += SCORE.captureBase + maxVictimProgress;
    }

    if (state.die === 6 && token?.progress === -1) {
      score += SCORE.exitYard;
    }

    // Reduced medium heuristic stops here.
    if ((state.options.aiDifficulty ?? 'medium') === 'medium') {
      return score;
    }

    if (outcome.targetProgress >= MAIN_PATH_STEPS) {
      score += SCORE.enterLane;
    }

    if (
      outcome.targetCell !== null &&
      this.isSafeCell(state, botId, outcome.targetCell)
    ) {
      score += SCORE.landSafe;
    }

    if (
      outcome.targetCell !== null &&
      this.isDangerous(state, botId, outcome.targetCell)
    ) {
      score += SCORE.dangerPenalty;
    }

    return score;
  }

  /** Star cells are safe for everyone; own start cell is safe for its owner. */
  private isSafeCell(
    state: PachisiState,
    botId: string,
    cell: number,
  ): boolean {
    if (STAR_CELLS.has(cell)) return true;
    const seat = state.seats[botId];
    if (seat === undefined) return false;
    return SEAT_START_OFFSETS[seat] === cell;
  }

  /** True when any opponent token can reach `cell` on its next roll. */
  private isDangerous(
    state: PachisiState,
    botId: string,
    cell: number,
  ): boolean {
    for (const ownerId of state.playerOrder) {
      if (ownerId === botId) continue;
      const ownerSeat = state.seats[ownerId];
      if (ownerSeat === undefined) continue;
      for (const token of tokensByPlayer(state, ownerId)) {
        const p = token.progress;
        if (p < 0 || p >= MAIN_PATH_STEPS) continue;
        for (let die = 1; die <= 6; die++) {
          if (
            p + die < MAIN_PATH_STEPS &&
            absoluteCell(ownerSeat, p + die) === cell
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /** Expert-only refinements: prefer stacking tokens on the own safe start. */
  private expertBonus(
    state: PachisiState,
    botId: string,
    move: LegalMove,
  ): number {
    const outcome = computeMoveOutcome(state, botId, move.tokenId);
    if (!outcome || outcome.targetCell === null) return 0;
    const seat = state.seats[botId];
    if (seat === undefined) return 0;
    if (
      outcome.targetCell === SEAT_START_OFFSETS[seat] &&
      outcome.captured.length === 0
    ) {
      return SCORE.stackOwnStart;
    }
    return 0;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
