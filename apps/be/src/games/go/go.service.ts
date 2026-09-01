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
import { BaseGameService } from '../common/base-game.service';
import {
  DEFAULT_BOARD_SIZE,
  DEFAULT_OPTIONS,
  BOARD_SIZES,
  MIN_PLAYERS,
  MAX_PLAYERS,
} from '../engines/go/go.constants';
import type { PlaceStonePayload } from '../engines/go/go.types';
import type { GoOptions } from '../engines/go/go.constants';
import { isAiDifficulty } from '../ai-difficulty';
import { GoBotService } from './go-bot.service';

@Injectable()
export class GoService extends BaseGameService<GoOptions> {
  protected readonly logger = new Logger(GoService.name);
  readonly gameId = 'go_v1';
  readonly gameName = 'Go';
  readonly minPlayers = MIN_PLAYERS;
  readonly maxPlayers = MAX_PLAYERS;

  constructor(
    roomsService: GameRoomsService,
    sessionsService: GameSessionsService,
    realtimeService: GamesRealtimeService,
    @Inject(forwardRef(() => GoBotService))
    botService: GoBotService,
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

  async placeStone(userId: string, roomId: string, payload: PlaceStonePayload) {
    return this.runAction(userId, roomId, 'place_stone', payload);
  }

  async passTurn(userId: string, roomId: string) {
    return this.runAction(userId, roomId, 'pass_turn', {});
  }

  protected resolveOptions(raw: unknown): GoOptions {
    const r = (raw ?? {}) as Partial<{
      theme: string;
      variant: string;
      boardSize: number;
      aiDifficulty: string;
    }>;
    const boardSize = (BOARD_SIZES as readonly number[]).includes(
      Number(r.boardSize),
    )
      ? (Number(r.boardSize) as GoOptions['boardSize'])
      : DEFAULT_BOARD_SIZE;
    return {
      theme: r.theme ?? r.variant ?? DEFAULT_OPTIONS.theme,
      boardSize,
      aiDifficulty: isAiDifficulty(r.aiDifficulty)
        ? r.aiDifficulty
        : DEFAULT_OPTIONS.aiDifficulty,
    };
  }
}
