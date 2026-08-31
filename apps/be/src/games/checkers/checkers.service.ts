import { Inject, Injectable, Logger, Optional, forwardRef } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import type Redis from 'ioredis';
import { GameRoomsService } from '../rooms/game-rooms.service';
import { GameSessionsService } from '../sessions/game-sessions.service';
import { GamesRealtimeService } from '../games.realtime.service';
import { MIN_PLAYERS } from '../engines/checkers/checkers.constants';
import type {
  CheckersOptions,
  CheckersState,
  MovePayload,
} from '../engines/checkers/checkers.types';
import { CheckersBotService } from './checkers-bot.service';
import { isAiDifficulty } from '../ai-difficulty';
import { BaseGameService } from '../common/base-game.service';

const MAX_PLAYERS = 2;

@Injectable()
export class CheckersService extends BaseGameService<CheckersOptions> {
  protected readonly logger = new Logger(CheckersService.name);
  readonly gameId = 'checkers_v1';
  readonly gameName = 'Checkers';
  readonly minPlayers = MIN_PLAYERS;
  readonly maxPlayers = MAX_PLAYERS;

  constructor(
    roomsService: GameRoomsService,
    sessionsService: GameSessionsService,
    realtimeService: GamesRealtimeService,
    @Inject(forwardRef(() => CheckersBotService))
    botService: CheckersBotService,
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

  async movePiece(userId: string, roomId: string, payload: MovePayload) {
    return this.runAction(userId, roomId, 'move_piece', payload);
  }

  protected resolveOptions(raw: unknown): CheckersOptions {
    const r = (raw ?? {}) as Partial<{
      variant: string;
      ruleVariant: string;
      forcedCaptures: boolean;
      backwardCaptures: boolean;
      botDifficulty: string;
      aiDifficulty: string;
    }>;
    return {
      variant: (r.variant as CheckersOptions['variant']) ?? 'classic',
      ruleVariant:
        (r.ruleVariant as CheckersOptions['ruleVariant']) ?? 'american',
      forcedCaptures: r.forcedCaptures !== false,
      backwardCaptures: r.backwardCaptures === true,
      botDifficulty: isAiDifficulty(r.botDifficulty)
        ? r.botDifficulty
        : isAiDifficulty(r.aiDifficulty)
          ? r.aiDifficulty
          : 'medium',
    };
  }
}

void ({} as CheckersState);
