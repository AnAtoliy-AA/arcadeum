import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { SeaBattleService } from './sea-battle.service';
import { GameSessionSummary } from '../sessions/game-sessions.service';
import {
  SeaBattleState,
  SeaBattlePlayer,
  Ship,
} from '../engines/sea-battle/sea-battle.types';
import {
  CELL_STATE,
  GAME_PHASE,
  BOARD_SIZE,
} from '../engines/sea-battle/sea-battle.constants';

@Injectable()
export class SeaBattleBotService {
  private readonly logger = new Logger(SeaBattleBotService.name);
  private readonly processing = new Map<string, number>(); // lockKey -> timestamp
  private readonly LOCK_TIMEOUT_MS = 30000; // 30 seconds

  constructor(
    @Inject(forwardRef(() => SeaBattleService))
    private readonly seaBattleService: SeaBattleService,
  ) {}

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
      if (!state) {
        this.logger.warn(
          `checkAndPlay skipped: no state for session ${session.roomId}`,
        );
        return;
      }

      const bots = state.players.filter((p: SeaBattlePlayer) =>
        this.isBot(p.playerId),
      );

      const currentPlayerId = state.playerOrder[state.currentTurnIndex];

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
          if (age < this.LOCK_TIMEOUT_MS) {
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

  private isBot(userId: string): boolean {
    return userId.startsWith('bot-');
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async handlePlacement(session: GameSessionSummary, botId: string) {
    const lockKey = `${session.roomId}:${botId}`;
    this.processing.set(lockKey, Date.now());

    try {
      await this.sleep(1000 + Math.random() * 2000);

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

      if (
        state.phase !== GAME_PHASE.PLACEMENT ||
        botPlayer?.placementComplete
      ) {
        return;
      }

      // Auto place ships
      await this.seaBattleService.autoPlaceShipsByRoom(botId, session.roomId);

      await this.sleep(500 + Math.random() * 1000);

      // Check current state again before confirming
      currentSession = await this.seaBattleService.findSessionByRoom(
        session.roomId,
      );
      if (!currentSession) return;
      state = currentSession.state as unknown as SeaBattleState;
      botPlayer = state.players.find((p) => p.playerId === botId);

      if (
        state.phase !== GAME_PHASE.PLACEMENT ||
        botPlayer?.placementComplete
      ) {
        return;
      }

      // Confirm placement
      await this.seaBattleService.confirmPlacementByRoom(botId, session.roomId);
    } finally {
      this.processing.delete(lockKey);
      // Re-trigger check in case battle phase started while we were locked
      const latestSession = await this.seaBattleService.findSessionByRoom(
        session.roomId,
      );
      if (latestSession) {
        this.checkAndPlay(latestSession).catch((err) =>
          this.logger.error(`Re-trigger failed for ${botId}: ${err}`),
        );
      }
    }
  }

  private async playTurn(sessionSnapshot: GameSessionSummary, botId: string) {
    const lockKey = `${sessionSnapshot.roomId}:${botId}`;
    this.processing.set(lockKey, Date.now());

    try {
      let isStillMyTurn = true;
      let currentSession = sessionSnapshot;

      while (isStillMyTurn) {
        await this.sleep(1000 + Math.random() * 1500);

        const state = currentSession.state as unknown as SeaBattleState;
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
        const currentPlayerId = state.playerOrder[state.currentTurnIndex];
        if (currentPlayerId !== botId || state.phase !== GAME_PHASE.BATTLE) {
          break;
        }

        // Pick a target: prioritize opponents with damaged ships (Locked-on strategy)
        const activeOpponents = state.players.filter(
          (p: SeaBattlePlayer) => p.playerId !== botId && p.alive,
        );
        if (activeOpponents.length === 0) {
          this.logger.warn(`Bot ${botId} playTurn: NO ACTIVE OPPONENTS FOUND!`);
          break;
        }

        const damagedOpponent = activeOpponents.find((p) =>
          p.ships.some((s: Ship) => s.hits > 0 && !s.sunk),
        );

        const target =
          damagedOpponent ||
          activeOpponents[Math.floor(Math.random() * activeOpponents.length)];

        // Smart Target Logic: Finish off damaged ships
        let choice: { r: number; c: number } | null =
          this.getSmartTarget(target);

        if (!choice) {
          // Use Hunt Mode (Random)
          const validCells: { r: number; c: number }[] = [];
          for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
              const cell = target.board[r][c];
              if (cell !== CELL_STATE.HIT && cell !== CELL_STATE.MISS) {
                validCells.push({ r, c });
              }
            }
          }

          if (validCells.length === 0) {
            break;
          }
          choice = validCells[Math.floor(Math.random() * validCells.length)];
        }

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
        const nextPlayerId = newState.playerOrder[newState.currentTurnIndex];
        isStillMyTurn =
          nextPlayerId === botId && newState.phase === GAME_PHASE.BATTLE;
      }
    } finally {
      this.processing.delete(lockKey);
    }
  }

  private getSmartTarget(
    target: SeaBattlePlayer,
  ): { r: number; c: number } | null {
    // Find a damaged but not sunk ship
    const damagedShip = target.ships.find((s: Ship) => s.hits > 0 && !s.sunk);

    if (damagedShip) {
      // Pick the first cell of this ship that isn't hit yet
      const nextCell = damagedShip.cells.find(
        (c) => target.board[c.row][c.col] !== CELL_STATE.HIT,
      );

      if (nextCell) {
        return { r: nextCell.row, c: nextCell.col };
      }
    }

    return null;
  }
}
