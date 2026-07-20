import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { SeaBattleService } from './sea-battle.service';
import { GameSessionSummary } from '../sessions/game-sessions.service';
import {
  SeaBattleState,
  SeaBattlePlayer,
  Ship,
  type AiDifficulty,
} from '../engines/sea-battle/sea-battle.types';
import {
  CELL_STATE,
  GAME_PHASE,
  BOARD_SIZE,
} from '../engines/sea-battle/sea-battle.constants';
import { getTeamForPlayer } from '../engines/sea-battle/team-rotation.utils';

const LOCK_TIMEOUT_MS = 60000;
const PROCESSING_ENTRY_TTL_MS = 120_000;

// Randomised bot delays make matches feel human without dragging on.
const PLACEMENT_DELAY_MS = { min: 500, max: 1500 };
const PLACEMENT_CONFIRM_DELAY_MS = { min: 250, max: 750 };
const ATTACK_DELAY_MS = { min: 500, max: 1250 };

@Injectable()
export class SeaBattleBotService {
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
      if (!state) return;

      const hasAliveHuman = state.players.some(
        (p: SeaBattlePlayer) => p.alive && !this.isBot(p.playerId),
      );
      if (!hasAliveHuman) {
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

  private isBot(userId: string): boolean {
    return userId.startsWith('bot-');
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
        await this.randomDelay(ATTACK_DELAY_MS);

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
        const currentPlayerId = state.playerOrder[state.currentTurnIndex];
        if (currentPlayerId !== botId || state.phase !== GAME_PHASE.BATTLE) {
          break;
        }

        // Pick a target: prioritize opponents with damaged ships (Locked-on strategy)
        const activeOpponents = state.players.filter(
          (p: SeaBattlePlayer) => p.playerId !== botId && p.alive,
        );
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

        // --- Special weapons: sonar / radar (free action, no turn advancement) ---
        const myUsage = state.specialWeaponUsage?.[botId];
        const hasSonar = !!state.specialWeapons?.sonar && !myUsage?.sonarUsed;
        const hasRadar = !!state.specialWeapons?.radar && !myUsage?.radarUsed;

        if (hasSonar) {
          const centerRow = Math.floor(gridSize / 2);
          const centerCol = Math.floor(gridSize / 2);
          await this.seaBattleService.executeActionByRoom(
            botId,
            currentSession.roomId,
            'useSonar',
            { targetPlayerId: target.playerId, row: centerRow, col: centerCol },
          );
          const refreshed = await this.seaBattleService.findSessionByRoom(
            currentSession.roomId,
          );
          if (!refreshed) break;
          currentSession = refreshed;
        } else if (hasRadar) {
          const row = Math.floor(Math.random() * gridSize);
          await this.seaBattleService.executeActionByRoom(
            botId,
            currentSession.roomId,
            'useRadar',
            { targetPlayerId: target.playerId, row },
          );
          const refreshed = await this.seaBattleService.findSessionByRoom(
            currentSession.roomId,
          );
          if (!refreshed) break;
          currentSession = refreshed;
        }

        // Difficulty-based targeting
        const difficulty: AiDifficulty = state.aiDifficulty ?? 'medium';
        let choice: { r: number; c: number } | null = null;
        if (difficulty === 'easy') {
          if (Math.random() < 0.3)
            choice = this.getSmartTarget(target, gridSize);
        } else if (difficulty === 'hard') {
          choice =
            this.getProbabilisticTarget(target, gridSize) ||
            this.getSmartTarget(target, gridSize);
        } else {
          choice = this.getSmartTarget(target, gridSize);
        }

        if (!choice) {
          const validCells: { r: number; c: number }[] = [];
          for (let r = 0; r < gridSize; r++)
            for (let c = 0; c < gridSize; c++)
              if (
                target.board[r][c] !== CELL_STATE.HIT &&
                target.board[r][c] !== CELL_STATE.MISS
              )
                validCells.push({ r, c });
          if (validCells.length === 0) break;
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
    gridSize: number = BOARD_SIZE,
  ): { r: number; c: number } | null {
    // Cells of already-sunk ships are public info; exclude them so we focus
    // on hits that still belong to damaged-but-unsunk ships.
    const sunkCells = new Set<string>();
    for (const ship of target.ships)
      if (ship.sunk)
        for (const cell of ship.cells) sunkCells.add(`${cell.row},${cell.col}`);

    const activeHits: { row: number; col: number }[] = [];
    for (let r = 0; r < gridSize; r++)
      for (let c = 0; c < gridSize; c++)
        if (
          target.board[r][c] === CELL_STATE.HIT &&
          !sunkCells.has(`${r},${c}`)
        )
          activeHits.push({ row: r, col: c });

    if (activeHits.length === 0) return null;

    const isOpen = (r: number, c: number): boolean => {
      if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return false;
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
        let fr = hit.row,
          fc = hit.col;
        while (activeSet.has(`${fr + dr},${fc + dc}`)) {
          fr += dr;
          fc += dc;
        }
        if (isOpen(fr + dr, fc + dc))
          lineCandidates.set(`${fr + dr},${fc + dc}`, {
            r: fr + dr,
            c: fc + dc,
          });
        let br = hit.row,
          bc = hit.col;
        while (activeSet.has(`${br - dr},${bc - dc}`)) {
          br -= dr;
          bc -= dc;
        }
        if (isOpen(br - dr, bc - dc))
          lineCandidates.set(`${br - dr},${bc - dc}`, {
            r: br - dr,
            c: bc - dc,
          });
      }
    }

    if (lineCandidates.size > 0) {
      const arr = Array.from(lineCandidates.values());
      return arr[Math.floor(Math.random() * arr.length)];
    }

    // Single-hit mode: probe a random orthogonal neighbour of any active hit.
    const dirs: [number, number][] = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    const neighbours = new Map<string, { r: number; c: number }>();
    for (const hit of activeHits) {
      for (const [dr, dc] of dirs) {
        const nr = hit.row + dr,
          nc = hit.col + dc;
        if (isOpen(nr, nc)) neighbours.set(`${nr},${nc}`, { r: nr, c: nc });
      }
    }
    if (neighbours.size === 0) return null;
    const arr = Array.from(neighbours.values());
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private getProbabilisticTarget(
    target: SeaBattlePlayer,
    gridSize: number = BOARD_SIZE,
  ): { r: number; c: number } | null {
    const sunkCells = new Set<string>();
    const remainingShipSizes: number[] = [];
    for (const ship of target.ships) {
      if (ship.sunk)
        for (const cell of ship.cells) sunkCells.add(`${cell.row},${cell.col}`);
      else if (ship.hits === 0) remainingShipSizes.push(ship.size);
    }

    if (remainingShipSizes.length === 0) return null;

    const density: number[][] = Array.from({ length: gridSize }, () =>
      Array<number>(gridSize).fill(0),
    );

    const isAvailable = (r: number, c: number): boolean =>
      r >= 0 &&
      r < gridSize &&
      c >= 0 &&
      c < gridSize &&
      target.board[r][c] !== CELL_STATE.HIT &&
      target.board[r][c] !== CELL_STATE.MISS &&
      !sunkCells.has(`${r},${c}`);

    for (const size of remainingShipSizes) {
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          if (c + size <= gridSize) {
            let ok = true;
            for (let k = 0; k < size && ok; k++) ok = isAvailable(r, c + k);
            if (ok) for (let k = 0; k < size; k++) density[r][c + k]++;
          }
          if (r + size <= gridSize) {
            let ok = true;
            for (let k = 0; k < size && ok; k++) ok = isAvailable(r + k, c);
            if (ok) for (let k = 0; k < size; k++) density[r + k][c]++;
          }
        }
      }
    }

    let maxDensity = 0;
    let candidates: { r: number; c: number }[] = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (!isAvailable(r, c)) continue;
        if (density[r][c] > maxDensity) {
          maxDensity = density[r][c];
          candidates = [{ r, c }];
        } else if (density[r][c] === maxDensity) candidates.push({ r, c });
      }
    }

    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
}
