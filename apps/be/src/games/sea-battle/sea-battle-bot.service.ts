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

  constructor(
    @Inject(forwardRef(() => SeaBattleService))
    private readonly seaBattleService: SeaBattleService,
  ) {}

  /**
   * Check if the bot needs to make a move
   */
  async checkAndPlay(session: GameSessionSummary) {
    try {
      if (session.status !== 'active') return;

      const state = session.state as unknown as SeaBattleState;
      if (!state) return;

      const bots = state.players.filter((p: SeaBattlePlayer) =>
        this.isBot(p.playerId),
      );

      for (const bot of bots) {
        if (state.phase === GAME_PHASE.PLACEMENT) {
          if (!bot.placementComplete) {
            await this.handlePlacement(session, bot.playerId);
          }
        } else if (state.phase === GAME_PHASE.BATTLE) {
          const currentPlayerId = state.playerOrder[state.currentTurnIndex];
          if (currentPlayerId === bot.playerId) {
            await this.playTurn(session, bot.playerId);
          }
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
    await this.sleep(1000 + Math.random() * 2000);

    // Auto place ships
    await this.seaBattleService.autoPlaceShipsByRoom(botId, session.roomId);

    await this.sleep(500 + Math.random() * 1000);

    // Confirm placement
    await this.seaBattleService.confirmPlacementByRoom(botId, session.roomId);
  }

  private async playTurn(session: GameSessionSummary, botId: string) {
    await this.sleep(1000 + Math.random() * 1500);

    const state = session.state as unknown as SeaBattleState;
    const botPlayer = state.players.find(
      (p: SeaBattlePlayer) => p.playerId === botId,
    );
    if (!botPlayer || !botPlayer.alive) return;

    // Pick a target
    const opponents = state.players.filter(
      (p: SeaBattlePlayer) => p.playerId !== botId && p.alive,
    );
    if (opponents.length === 0) return;

    const target = opponents[Math.floor(Math.random() * opponents.length)];

    // Smart Target Logic: Finish off damaged ships
    let choice: { r: number; c: number } | null = this.getSmartTarget(target);

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

      if (validCells.length === 0) return;
      choice = validCells[Math.floor(Math.random() * validCells.length)];
    }

    await this.seaBattleService.attackByRoom(botId, session.roomId, {
      targetPlayerId: target.playerId,
      row: choice.r,
      col: choice.c,
    });
  }

  private getSmartTarget(
    target: SeaBattlePlayer,
  ): { r: number; c: number } | null {
    // Find a damaged but not sunk ship
    const damagedShip = target.ships.find(
      (s: Ship) => s.hits > 0 && s.hits < s.size,
    );

    if (damagedShip) {
      // Find valid neighbors for the damaged ship
      const hitCells = damagedShip.cells.filter(
        (c: { row: number; col: number }) =>
          target.board[c.row][c.col] === CELL_STATE.HIT,
      );

      const candidates: { r: number; c: number }[] = [];

      if (hitCells.length > 1) {
        // Determine direction
        const sorted = [...hitCells].sort(
          (a, b) => a.row - b.row || a.col - b.col,
        );
        const first = sorted[0];
        const last = sorted[sorted.length - 1];

        if (first && last) {
          const isVertical = first.col === last.col;

          if (isVertical) {
            candidates.push({ r: first.row - 1, c: first.col });
            candidates.push({ r: last.row + 1, c: last.col });
          } else {
            candidates.push({ r: first.row, c: first.col - 1 });
            candidates.push({ r: first.row, c: first.col + 1 });
          }
        }
      } else if (hitCells.length === 1) {
        // Try all 4 neighbors
        const hit = hitCells[0];
        if (hit) {
          candidates.push({ r: hit.row - 1, c: hit.col });
          candidates.push({ r: hit.row + 1, c: hit.col });
          candidates.push({ r: hit.row, c: hit.col - 1 });
          candidates.push({ r: hit.row, c: hit.col + 1 });
        }
      }

      // Filter valid candidates
      const validCandidates = candidates.filter((pos) => {
        if (
          pos.r < 0 ||
          pos.r >= BOARD_SIZE ||
          pos.c < 0 ||
          pos.c >= BOARD_SIZE
        )
          return false;
        const cell = target.board[pos.r][pos.c];
        return cell !== CELL_STATE.HIT && cell !== CELL_STATE.MISS;
      });

      if (validCandidates.length > 0) {
        return validCandidates[
          Math.floor(Math.random() * validCandidates.length)
        ];
      }
    }

    return null;
  }
}
