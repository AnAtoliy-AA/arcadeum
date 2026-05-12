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
import { getTeamForPlayer } from '../engines/sea-battle/team-rotation.utils';

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

        // In team mode, exclude teammates from the candidate pool
        const botTeam = getTeamForPlayer(state, botId);
        const eligibleOpponents = botTeam
          ? activeOpponents.filter(
              (p) => !botTeam.playerIds.includes(p.playerId),
            )
          : activeOpponents;

        if (eligibleOpponents.length === 0) {
          this.logger.warn(`Bot ${botId} playTurn: NO ACTIVE OPPONENTS FOUND!`);
          break;
        }

        const damagedOpponent = eligibleOpponents.find((p) =>
          p.ships.some((s: Ship) => s.hits > 0 && !s.sunk),
        );

        const target =
          damagedOpponent ||
          eligibleOpponents[
            Math.floor(Math.random() * eligibleOpponents.length)
          ];

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
    // Cells of already-sunk ships are public info; exclude them so we focus
    // on hits that still belong to damaged-but-unsunk ships.
    const sunkCells = new Set<string>();
    for (const ship of target.ships) {
      if (!ship.sunk) continue;
      for (const cell of ship.cells) {
        sunkCells.add(`${cell.row},${cell.col}`);
      }
    }

    const activeHits: { row: number; col: number }[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (target.board[r][c] !== CELL_STATE.HIT) continue;
        if (sunkCells.has(`${r},${c}`)) continue;
        activeHits.push({ row: r, col: c });
      }
    }

    if (activeHits.length === 0) return null;

    const isOpen = (r: number, c: number): boolean => {
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return false;
      const cell = target.board[r][c];
      return cell !== CELL_STATE.HIT && cell !== CELL_STATE.MISS;
    };

    // Line mode: if two adjacent active hits sit in a line (e.g. d3+d4),
    // extend the line from either endpoint (d2 or d5).
    const activeSet = new Set(activeHits.map((h) => `${h.row},${h.col}`));
    const lineCandidates = new Map<string, { r: number; c: number }>();
    const axes: [number, number][] = [
      [0, 1],
      [1, 0],
    ];

    for (const hit of activeHits) {
      for (const [dr, dc] of axes) {
        if (!activeSet.has(`${hit.row + dr},${hit.col + dc}`)) continue;

        // Walk forward to the far end of the line.
        let fr = hit.row;
        let fc = hit.col;
        while (activeSet.has(`${fr + dr},${fc + dc}`)) {
          fr += dr;
          fc += dc;
        }
        if (isOpen(fr + dr, fc + dc)) {
          lineCandidates.set(`${fr + dr},${fc + dc}`, {
            r: fr + dr,
            c: fc + dc,
          });
        }

        // Walk backward to the near end of the line.
        let br = hit.row;
        let bc = hit.col;
        while (activeSet.has(`${br - dr},${bc - dc}`)) {
          br -= dr;
          bc -= dc;
        }
        if (isOpen(br - dr, bc - dc)) {
          lineCandidates.set(`${br - dr},${bc - dc}`, {
            r: br - dr,
            c: bc - dc,
          });
        }
      }
    }

    if (lineCandidates.size > 0) {
      const arr = Array.from(lineCandidates.values());
      return arr[Math.floor(Math.random() * arr.length)];
    }

    // Single-hit mode: probe a random orthogonal neighbour of any active hit.
    const neighbours = new Map<string, { r: number; c: number }>();
    const directions: [number, number][] = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    for (const hit of activeHits) {
      for (const [dr, dc] of directions) {
        const nr = hit.row + dr;
        const nc = hit.col + dc;
        if (!isOpen(nr, nc)) continue;
        neighbours.set(`${nr},${nc}`, { r: nr, c: nc });
      }
    }

    if (neighbours.size === 0) return null;
    const arr = Array.from(neighbours.values());
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
