import {
  Inject,
  Injectable,
  Logger,
  Optional,
  forwardRef,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import type Redis from 'ioredis';
import { GameRoomsService } from '../rooms/game-rooms.service';
import { GameSessionsService } from '../sessions/game-sessions.service';
import { GamesRealtimeService } from '../games.realtime.service';
import {
  DEFAULT_OPTIONS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  MODES,
  TEAMS_PLAYER_COUNT,
  type PachisiOptions,
  type Mode,
} from '../engines/pachisi/pachisi.constants';
import { PachisiBotService } from './pachisi-bot.service';
import { isAiDifficulty } from '../ai-difficulty';
import { BaseGameService } from '../common/base-game.service';
import type { StartGameSessionResult } from '../games.types';

@Injectable()
export class PachisiService extends BaseGameService<PachisiOptions> {
  protected readonly logger = new Logger(PachisiService.name);
  readonly gameId = 'pachisi_v1';
  readonly gameName = 'Pachisi';
  readonly minPlayers = MIN_PLAYERS;
  readonly maxPlayers = MAX_PLAYERS;

  constructor(
    roomsService: GameRoomsService,
    sessionsService: GameSessionsService,
    realtimeService: GamesRealtimeService,
    @Inject(forwardRef(() => PachisiBotService))
    botService: PachisiBotService,
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

  async rollDice(userId: string, roomId: string) {
    return this.runAction(userId, roomId, 'roll_dice', {});
  }

  async moveToken(
    userId: string,
    roomId: string,
    tokenId: number,
    ownerId?: string,
  ) {
    return this.runAction(
      userId,
      roomId,
      'move_token',
      ownerId ? { tokenId, ownerId } : { tokenId },
    );
  }

  async passTurn(userId: string, roomId: string) {
    return this.runAction(userId, roomId, 'pass_turn', {});
  }

  protected resolveOptions(raw: unknown): PachisiOptions {
    const r = (raw ?? {}) as Partial<{
      theme: string;
      variant: string;
      mode: string;
      aiDifficulty: string;
      teams: unknown;
    }>;
    return {
      theme: r.theme ?? r.variant ?? DEFAULT_OPTIONS.theme,
      mode: MODES.includes(r.mode as Mode)
        ? (r.mode as Mode)
        : DEFAULT_OPTIONS.mode,
      aiDifficulty: isAiDifficulty(r.aiDifficulty)
        ? r.aiDifficulty
        : DEFAULT_OPTIONS.aiDifficulty,
      teams: r.teams === true,
    };
  }

  /**
   * Team play is 2v2 and needs exactly four seats, so a team room always
   * starts with four players: bots fill the empty seats (partners sit
   * opposite, i.e. seats 1/3 and 2/4 in join order).
   */
  async startSession(
    userId: string,
    roomId: string,
    withBots?: boolean,
    botCount?: number,
    startExtras?: unknown,
  ): Promise<StartGameSessionResult> {
    const room = await this.roomsService.getRoom(roomId, userId);
    if (this.resolveOptions(room.gameOptions).teams) {
      const participants = await this.roomsService.getRoomParticipants(roomId);
      const humans = participants.filter((p) => !p.startsWith('bot-')).length;
      const existingBots = participants.length - humans;
      const missing = Math.max(0, TEAMS_PLAYER_COUNT - participants.length);
      return super.startSession(
        userId,
        roomId,
        true,
        existingBots + missing,
        startExtras,
      );
    }
    return super.startSession(userId, roomId, withBots, botCount, startExtras);
  }
}
