import { Inject, Injectable, Logger, Optional, forwardRef } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import type Redis from 'ioredis';
import { GameRoomsService } from '../rooms/game-rooms.service';
import { GameSessionsService } from '../sessions/game-sessions.service';
import { GamesRealtimeService } from '../games.realtime.service';
import type { StartGameSessionResult } from '../games.types';
import { SeaBattleBotService } from './sea-battle-bot.service';
import {
  MAX_PLAYERS,
  MAX_PLAYERS_TEAM_MODE,
} from '../engines/sea-battle/sea-battle.constants';
import type { SeaBattleGameOptions } from '../rooms/sea-battle-team-config.types';
import type { AiDifficulty } from '../engines/sea-battle/sea-battle.types';
import { BaseGameService } from '../common/base-game.service';
import { extractAiVsAiExtras } from '../common/ai-vs-ai';

interface PlaceShipPayload {
  shipId: string;
  cells: { row: number; col: number }[];
}

interface MoveShipPayload {
  shipId: string;
  cells: { row: number; col: number }[];
}

interface AttackPayload {
  targetPlayerId: string;
  row: number;
  col: number;
}

export interface SeaBattleStartExtras {
  difficulty?: AiDifficulty;
  gridSize?: number;
  shipCount?: number;
  variant?: string;
  aiVsAi?: boolean;
  aiMoveDelayMs?: number;
}

const MIN_PLAYERS = 2;

@Injectable()
export class SeaBattleService extends BaseGameService<Record<string, unknown>> {
  protected readonly logger = new Logger(SeaBattleService.name);
  readonly gameId = 'sea_battle_v1';
  readonly gameName = 'Sea Battle';
  readonly minPlayers = MIN_PLAYERS;
  readonly maxPlayers = MAX_PLAYERS;

  constructor(
    roomsService: GameRoomsService,
    sessionsService: GameSessionsService,
    realtimeService: GamesRealtimeService,
    @Inject(forwardRef(() => SeaBattleBotService))
    botService: SeaBattleBotService,
    @InjectConnection() mongoConnection: Connection,
    @Optional() @Inject('REDIS_CLIENT') redis?: Redis | null,
  ) {
    super(
      roomsService,
      sessionsService,
      realtimeService,
      botService,
      mongoConnection,
      undefined,
      redis,
    );
  }

  protected resolveOptions(raw: unknown): Record<string, unknown> {
    return (raw as Record<string, unknown> | null | undefined) ?? {};
  }

  /**
   * Start a Sea Battle session
   * (Verified fix for single player bot mode)
   */
  async startSession(
    userId: string,
    roomId: string,
    withBots?: boolean,
    botCount?: number,
    startExtras: SeaBattleStartExtras = {},
  ): Promise<StartGameSessionResult> {
    const room = await this.roomsService.getRoom(roomId, userId);

    if (room.hostId !== userId) {
      throw new Error('Only the host can start the game');
    }

    const opts = (room.gameOptions ?? {}) as SeaBattleGameOptions;
    const { difficulty, gridSize, shipCount, variant } = startExtras;

    // Client-side values override stale room.gameOptions (race condition fix)
    if (gridSize !== undefined) opts.gridSize = gridSize;
    if (shipCount !== undefined) opts.shipCount = shipCount;
    if (variant !== undefined) opts.variant = variant;

    // Persist overrides so bots and reconnects see the same config
    await this.roomsService.updateRoomOptions(roomId, userId, {
      ...(gridSize !== undefined ? { gridSize } : {}),
      ...(shipCount !== undefined ? { shipCount } : {}),
      ...(variant !== undefined ? { variant } : {}),
    });

    const teamMode = !!opts.teamMode;
    const cap = teamMode ? MAX_PLAYERS_TEAM_MODE : MAX_PLAYERS;

    const participants = await this.roomsService.getRoomParticipants(roomId);
    const playerIds = [...participants];

    // If only one player, automatically add a bot to meet minimum requirements (2 players)
    // This handles both explicit bot mode and fallback for single users
    // In team mode, bots are added during lobby (addBotToTeam), so skip auto-fill here
    if (!teamMode && playerIds.length === 1) {
      const targetBotCount = botCount !== undefined ? botCount : 1;
      const needed = Math.min(cap - 1, targetBotCount);
      for (let i = 0; i < needed; i++) {
        playerIds.push(`bot-${crypto.randomUUID()}`);
      }
    } else if (!teamMode && withBots) {
      const targetTotalPlayers = playerIds.length + (botCount || 1);
      const needed = Math.min(
        cap - playerIds.length,
        Math.max(0, targetTotalPlayers - playerIds.length),
      );
      for (let i = 0; i < needed; i++) {
        playerIds.push(`bot-${crypto.randomUUID()}`);
      }
    }

    if (playerIds.length < MIN_PLAYERS) {
      throw new Error('Not enough players to start Sea Battle (minimum 2)');
    }

    if (playerIds.length > cap) {
      throw new Error(`Too many players to start Sea Battle (maximum ${cap})`);
    }

    if (teamMode) {
      if (!opts.teams || opts.teams.length < 2) {
        throw new Error('Team mode requires at least 2 configured teams');
      }
      for (const t of opts.teams) {
        if (t.playerIds.length !== t.targetSize) {
          throw new Error(`Team "${t.name}" is not full`);
        }
      }
    }

    const session = await this.sessionsService.createSession({
      roomId,
      gameId: room.gameId,
      playerIds,
      config: {
        ...opts,
        ...(teamMode
          ? {
              teams: opts.teams!.map((t) => ({
                id: t.id,
                name: t.name,
                color: t.color,
                playerIds: t.playerIds,
              })),
              hideShipsFromTeammates: !!opts.hideShipsFromTeammates,
            }
          : {}),
        ...(difficulty ? { aiDifficulty: difficulty } : {}),
      },
      options: extractAiVsAiExtras(startExtras) ?? undefined,
    });

    await this.roomsService.updateRoomStatus(roomId, 'in_progress');
    const updatedRoom = { ...room, status: 'in_progress' as const };
    await this.realtimeService.emitGameStarted(
      updatedRoom,
      session,
      async (s, pId) => {
        const sanitized = await this.sessionsService.getSanitizedStateForPlayer(
          s.id,
          pId,
        );
        if (sanitized && typeof sanitized === 'object') {
          return { ...s, state: sanitized as Record<string, unknown> };
        }
        return s;
      },
    );

    const updatedSession = await this.afterSessionStep(session);
    return { room: updatedRoom, session: updatedSession };
  }

  /**
   * Place a ship on the board
   */
  async placeShipByRoom(
    userId: string,
    roomId: string,
    payload: PlaceShipPayload,
  ) {
    return this.runAction(userId, roomId, 'placeShip', payload);
  }

  /**
   * Move an already-placed ship to a new position on the board
   */
  async moveShipByRoom(
    userId: string,
    roomId: string,
    payload: MoveShipPayload,
  ) {
    return this.runAction(userId, roomId, 'moveShip', payload);
  }

  /**
   * Confirm ship placement is complete
   */
  async confirmPlacementByRoom(
    userId: string,
    roomId: string,
    ships?: Array<{ shipId: string; cells: { row: number; col: number }[] }>,
  ) {
    return this.runAction(
      userId,
      roomId,
      'confirmPlacement',
      ships ? { ships } : {},
    );
  }

  /**
   * Attack an opponent's cell
   */
  async attackByRoom(userId: string, roomId: string, payload: AttackPayload) {
    return this.runAction(userId, roomId, 'attack', payload);
  }

  /**
   * Execute a generic action (e.g. useSonar, useRadar)
   */
  async executeActionByRoom(
    userId: string,
    roomId: string,
    action: string,
    payload: Record<string, unknown>,
  ) {
    return this.runAction(userId, roomId, action, payload);
  }

  /**
   * Reset ship placement
   */
  async resetPlacementByRoom(userId: string, roomId: string) {
    return this.runAction(userId, roomId, 'resetPlacement', {});
  }

  /**
   * Auto place ships for a player
   */
  async autoPlaceShipsByRoom(userId: string, roomId: string) {
    return this.runAction(userId, roomId, 'autoPlace', {});
  }
}
