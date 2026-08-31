import { Inject, Injectable, Logger, Optional, forwardRef } from '@nestjs/common';
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
  type BackgammonOptions,
  type RuleVariant,
  type Variant,
} from '../engines/backgammon/backgammon.constants';
import type { MoveCheckerPayload } from '../engines/backgammon/backgammon.types';
import { BackgammonBotService } from './backgammon-bot.service';
import { isAiDifficulty } from '../ai-difficulty';
import { BaseGameService } from '../common/base-game.service';

@Injectable()
export class BackgammonService extends BaseGameService<BackgammonOptions> {
  protected readonly logger = new Logger(BackgammonService.name);
  readonly gameId = 'backgammon_v1';
  readonly gameName = 'Backgammon';
  readonly minPlayers = MIN_PLAYERS;
  readonly maxPlayers = MAX_PLAYERS;

  constructor(
    roomsService: GameRoomsService,
    sessionsService: GameSessionsService,
    realtimeService: GamesRealtimeService,
    @Inject(forwardRef(() => BackgammonBotService))
    botService: BackgammonBotService,
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

  async rollDice(userId: string, roomId: string, dice?: [number, number]) {
    return this.runAction(userId, roomId, 'roll_dice', { dice });
  }

  async moveChecker(
    userId: string,
    roomId: string,
    payload: MoveCheckerPayload,
  ) {
    return this.runAction(userId, roomId, 'move_checker', payload);
  }

  async passTurn(userId: string, roomId: string) {
    return this.runAction(userId, roomId, 'pass_turn', {});
  }

  protected resolveOptions(raw: unknown): BackgammonOptions {
    const r = (raw ?? {}) as Partial<{
      variant: string;
      ruleVariant: string;
      aiDifficulty: string;
    }>;
    return {
      variant: (r.variant as Variant) ?? DEFAULT_OPTIONS.variant,
      ruleVariant:
        (r.ruleVariant as RuleVariant) ?? DEFAULT_OPTIONS.ruleVariant,
      aiDifficulty: isAiDifficulty(r.aiDifficulty)
        ? r.aiDifficulty
        : DEFAULT_OPTIONS.aiDifficulty,
    };
  }
}
