import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { SeaBattleService } from './sea-battle.service';
import type { GameSessionSummary } from '../sessions/game-sessions.service';
import type {
  SeaBattlePlayer,
  SeaBattleState,
} from '@arcadeum/games-core/games/sea-battle/sea-battle.types';
import {
  GAME_PHASE,
  BOARD_SIZE,
} from '@arcadeum/games-core/games/sea-battle/sea-battle.constants';
import { SeaBattleBot } from '@arcadeum/games-core/games/sea-battle/sea-battle-bot';
import { getAiMoveDelayMs, isAiVsAiSession } from '../common/ai-vs-ai';

const LOCK_TIMEOUT_MS = 60000;
const PROCESSING_ENTRY_TTL_MS = 120_000;

// Randomised bot delays make matches feel human without dragging on.
const PLACEMENT_DELAY_MS = { min: 500, max: 1500 };
const PLACEMENT_CONFIRM_DELAY_MS = { min: 250, max: 750 };
const ATTACK_DELAY_MS = { min: 500, max: 1250 };

@Injectable()
export class SeaBattleBotService extends SeaBattleBot {
  private readonly logger = new Logger(SeaBattleBotService.name);
  private readonly processing = new Map<string, number>(); // lockKey -> timestamp
  // Per-room placement chain. When several bots auto-place at the same time
  // each one was racing on session.state (read → clone → write), so the last
  // save clobbered the others and the loser confirmed with 0/10 ships. This
  // queues placement engine calls per room while leaving each bot's
  // human-feeling delay in parallel.
  private readonly placementChain = new Map<string, Promise<unknown>>();

  private chainPlacement<T>(
    roomId: string,
    task: () => Promise<T>,
  ): Promise<T> {
    const prev = this.placementChain.get(roomId) ?? Promise.resolve();
    const next = prev.catch(() => undefined).then(task);
    const settled = next.catch(() => undefined);
    this.placementChain.set(roomId, settled);
    void settled.finally(() => {
      if (this.placementChain.get(roomId) === settled) {
        this.placementChain.delete(roomId);
      }
    });
    return next;
  }

  constructor(
    @Inject(forwardRef(() => SeaBattleService))
    private readonly seaBattleService: SeaBattleService,
  ) {
    super();
  }

  /**
   * Check if the bot needs to make a move
   */
  async checkAndPlay(session: GameSessionSummary) {
    try {
      await Promise.resolve(); // Satisfy async requirement
      if (session.status !== 'active') {
        return;
      }

      const state = session.state as unknown as SeaBattleState;
      if (!state) return;

      const hasAliveHuman = state.players.some(
        (p: SeaBattlePlayer) => p.alive && !this.isBot(p.playerId),
      );
      if (!hasAliveHuman && !isAiVsAiSession(session)) {
        this.logger.log(
          `No alive humans in room ${session.roomId} — completing session`,
        );
        await this.seaBattleService.completeSession(session.id, session.roomId);
        return;
      }

      const now = Date.now();
      for (const [key, ts] of this.processing) {
        if (now - ts > PROCESSING_ENTRY_TTL_MS) this.processing.delete(key);
      }

      const bots = state.players.filter((p: SeaBattlePlayer) =>
        this.isBot(p.playerId),
      );

      const currentPlayerId = this.getCurrentPlayerId(state);

      for (const bot of bots) {
        const lockKey = `${session.roomId}:${bot.playerId}`;
        const isMyTurn =
          state.phase === GAME_PHASE.BATTLE && currentPlayerId === bot.playerId;
        const needsPlacement =
          state.phase === GAME_PHASE.PLACEMENT && !bot.placementComplete;

        if (!isMyTurn && !needsPlacement) {
          continue;
        }

        const lockTime = this.processing.get(lockKey);
        if (lockTime) {
          const age = Date.now() - lockTime;
          if (age < LOCK_TIMEOUT_MS) {
            continue;
          } else {
            this.logger.warn(
              `Bot ${bot.playerId} lock EXPIRED (age ${age}ms). Overriding.`,
            );
          }
        }

        if (needsPlacement) {
          this.handlePlacement(session, bot.playerId).catch((err) =>
            this.logger.error(`Placement failed for ${bot.playerId}: ${err}`),
          );
        } else if (isMyTurn) {
          this.playTurn(session, bot.playerId).catch((err) =>
            this.logger.error(`Turn failed for ${bot.playerId}: ${err}`),
          );
        }
      }
    } catch (error) {
      this.logger.error(`Bot failed to play in Sea Battle: ${error}`);
    }
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async randomDelay(range: { min: number; max: number }) {
    await this.sleep(range.min + Math.random() * (range.max - range.min));
  }

  private async handlePlacement(session: GameSessionSummary, botId: string) {
    const lockKey = `${session.roomId}:${botId}`;
    this.processing.set(lockKey, Date.now());

    try {
      await this.randomDelay(PLACEMENT_DELAY_MS);

      // Check current state before auto-placing
      let currentSession = await this.seaBattleService.findSessionByRoom(
        session.roomId,
      );
      if (!currentSession) {
        this.logger.warn(`Bot ${botId} handlePlacement: session not found`);
        return;
      }
      let state = currentSession.state as unknown as SeaBattleState;
      let botPlayer = state.players.find((p) => p.playerId === botId);

      if (state.phase !== GAME_PHASE.PLACEMENT || botPlayer?.placementComplete)
        return;

      // Auto place ships — serialized per room so concurrent bots don't
      // overwrite each other's freshly-placed ships.
      await this.chainPlacement(session.roomId, () =>
        this.seaBattleService.autoPlaceShipsByRoom(botId, session.roomId),
      );

      await this.randomDelay(PLACEMENT_CONFIRM_DELAY_MS);

      // Check current state again before confirming
      currentSession = await this.seaBattleService.findSessionByRoom(
        session.roomId,
      );
      if (!currentSession) return;
      state = currentSession.state as unknown as SeaBattleState;
      botPlayer = state.players.find((p) => p.playerId === botId);

      if (state.phase !== GAME_PHASE.PLACEMENT || botPlayer?.placementComplete)
        return;

      // Confirm placement — same per-room queue so the confirm only runs
      // after this bot's autoPlace save has landed.
      await this.chainPlacement(session.roomId, () =>
        this.seaBattleService.confirmPlacementByRoom(botId, session.roomId),
      );
    } finally {
      this.processing.delete(lockKey);
      // Re-trigger check in case battle phase started while we were locked
      const latestSession = await this.seaBattleService.findSessionByRoom(
        session.roomId,
      );
      if (latestSession)
        this.checkAndPlay(latestSession).catch((err) =>
          this.logger.error(`Re-trigger failed for ${botId}: ${err}`),
        );
    }
  }

  private async playTurn(sessionSnapshot: GameSessionSummary, botId: string) {
    const lockKey = `${sessionSnapshot.roomId}:${botId}`;
    this.processing.set(lockKey, Date.now());

    try {
      let isStillMyTurn = true;
      let currentSession = sessionSnapshot;

      while (isStillMyTurn) {
        const aiDelay = getAiMoveDelayMs(sessionSnapshot);
        if (aiDelay !== null) {
          await this.sleep(aiDelay);
        } else {
          await this.randomDelay(ATTACK_DELAY_MS);
        }

        const state = currentSession.state as unknown as SeaBattleState;
        const gridSize = state.gridSize ?? BOARD_SIZE;
        const botPlayer = state.players.find(
          (p: SeaBattlePlayer) => p.playerId === botId,
        );
        if (!botPlayer || !botPlayer.alive) {
          this.logger.warn(
            `Bot ${botId} playTurn: bot not found or dead (alive=${botPlayer?.alive})`,
          );
          break;
        }

        // Verify it is still our turn (in case of double triggers or phase changes)
        const currentPlayerId = this.getCurrentPlayerId(state);
        if (currentPlayerId !== botId || state.phase !== GAME_PHASE.BATTLE) {
          break;
        }

        // Pick a target: prioritize opponents with damaged ships (Locked-on strategy)
        const target = this.pickTargetOpponent(state, botId);
        if (!target) {
          this.logger.warn(`Bot ${botId} playTurn: NO ACTIVE OPPONENTS FOUND!`);
          break;
        }

        // --- Special weapons: sonar / radar (free action, no turn advancement) ---
        const specialAction = this.pickSpecialWeaponAction(
          state,
          botId,
          target,
          gridSize,
        );
        if (specialAction) {
          await this.seaBattleService.executeActionByRoom(
            botId,
            currentSession.roomId,
            specialAction.action,
            specialAction.payload as unknown as Record<string, unknown>,
          );
          const refreshed = await this.seaBattleService.findSessionByRoom(
            currentSession.roomId,
          );
          if (!refreshed) break;
          currentSession = refreshed;
        }

        // Difficulty-based targeting
        const choice = this.pickAttackCell(state, target, gridSize);
        if (!choice) break;

        // Execute attack and update currentSession
        currentSession = await this.seaBattleService.attackByRoom(
          botId,
          currentSession.roomId,
          {
            targetPlayerId: target.playerId,
            row: choice.r,
            col: choice.c,
          },
        );

        // Check if it's still our turn after the attack (hit = true, miss = false)
        const newState = currentSession.state as unknown as SeaBattleState;
        isStillMyTurn =
          this.getCurrentPlayerId(newState) === botId &&
          newState.phase === GAME_PHASE.BATTLE;
      }
    } finally {
      this.processing.delete(lockKey);
    }
  }
}
